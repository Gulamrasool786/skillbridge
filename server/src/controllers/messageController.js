import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import FreelancerProfile from "../models/FreelancerProfile.js";

function participantFilter(userId) {
  return {
    $or: [
      { client: userId },
      { freelancer: userId },
    ],
  };
}

function serializeMessage(message) {
  return {
    id: message._id.toString(),
    senderId: message.sender.toString(),
    text: message.text,
    createdAt: message.createdAt,
  };
}

async function findOwnConversation(req) {
  const { conversationId } = req.params;

  if (!mongoose.isObjectIdOrHexString(conversationId)) {
    return null;
  }

  return Conversation.findOne({
    _id: conversationId,
    ...participantFilter(req.user._id),
  });
}

function unavailable(res) {
  return res.status(404).json({
    success: false,
    message: "Conversation unavailable.",
  });
}

export async function startConversation(req, res, next) {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can start a conversation.",
      });
    }

    const { profileId } = req.body ?? {};

    if (
      typeof profileId !== "string" ||
      !mongoose.isObjectIdOrHexString(profileId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid freelancer profile.",
      });
    }

    const profile = await FreelancerProfile.findOne({
      _id: profileId,
      status: "Published",
    }).populate({
      path: "owner",
      select: "_id",
      match: { role: "freelancer" },
    });

    if (!profile?.owner) {
      return res.status(404).json({
        success: false,
        message: "This profile is unavailable.",
      });
    }

    if (profile.owner._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself.",
      });
    }

    const participants = {
      client: req.user._id,
      freelancer: profile.owner._id,
    };

    let conversation =
      await Conversation.findOne(participants);

    if (!conversation) {
      try {
        conversation = await Conversation.create(participants);
      } catch (error) {
        if (error.code !== 11000) throw error;

        conversation =
          await Conversation.findOne(participants);

        if (!conversation) throw error;
      }
    }

    return res.status(200).json({
      success: true,
      conversationId: conversation._id.toString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find(
      participantFilter(req.user._id)
    )
      .populate("client", "name")
      .populate("freelancer", "name");

    const results = await Promise.all(
      conversations.map(async (conversation) => {
        const isClient =
          conversation.client?._id.toString() ===
          req.user._id.toString();

        const other = isClient
          ? conversation.freelancer
          : conversation.client;

        const lastRead = isClient
          ? conversation.clientLastReadMessage
          : conversation.freelancerLastReadMessage;

        const unreadFilter = {
          conversation: conversation._id,
          sender: { $ne: req.user._id },
        };

        if (lastRead) {
          unreadFilter._id = { $gt: lastRead };
        }

        const [unreadCount, latestMessage] = await Promise.all([
          Message.countDocuments(unreadFilter),

          Message.findOne({
            conversation: conversation._id,
          })
            .sort({ _id: -1 })
            .select("text sender createdAt")
            .lean(),
        ]);

        return {
          id: conversation._id.toString(),
          otherName: other?.name || "Unavailable account",
          otherRole: isClient ? "freelancer" : "client",
          unreadCount,

          lastMessage: latestMessage
            ? {
                id: latestMessage._id.toString(),
                senderId: latestMessage.sender.toString(),
                text: latestMessage.text
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 160),
                createdAt: latestMessage.createdAt,
              }
            : null,

          lastActivityAt:
            latestMessage?.createdAt ?? conversation.createdAt,
        };
      })
    );

    results.sort((a, b) => {
      const timeDifference =
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime();

      if (timeDifference !== 0) return timeDifference;

      const aKey = a.lastMessage?.id ?? a.id;
      const bKey = b.lastMessage?.id ?? b.id;

      return bKey.localeCompare(aKey);
    });

    return res.status(200).json({
      success: true,
      conversations: results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const conversation = await findOwnConversation(req);

    if (!conversation) return unavailable(res);

    const filter = {
      conversation: conversation._id,
    };

    const { before } = req.query;

    if (before !== undefined) {
      if (
        typeof before !== "string" ||
        !mongoose.isObjectIdOrHexString(before)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid message cursor.",
        });
      }

      filter._id = { $lt: before };
    }

    const rows = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(51);

    return res.status(200).json({
      success: true,
      messages: rows
        .slice(0, 50)
        .reverse()
        .map(serializeMessage),
      hasOlder: rows.length > 50,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversation = await findOwnConversation(req);

    if (!conversation) return unavailable(res);

    const { text, requestId } = req.body ?? {};

    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Write a message between 1 and 2,000 characters.",
      });
    }

    if (
      typeof requestId !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message request identifier.",
      });
    }

    const identity = {
      conversation: conversation._id,
      sender: req.user._id,
      requestId,
    };

    const cleanText = text.trim();
    let message;

    try {
      message = await Message.create({
        ...identity,
        text: cleanText,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;

      message = await Message.findOne(identity);

      if (!message || message.text !== cleanText) {
        return res.status(409).json({
          success: false,
          message: "This request identifier has already been used.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: serializeMessage(message),
    });
  } catch (error) {
    next(error);
  }
}

export async function markConversationRead(req, res, next) {
  try {
    const conversation = await findOwnConversation(req);

    if (!conversation) return unavailable(res);

    const { messageId } = req.body ?? {};

    if (
      typeof messageId !== "string" ||
      !mongoose.isObjectIdOrHexString(messageId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid message.",
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversation._id,
    }).select("_id");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message unavailable.",
      });
    }

    const field = conversation.client.equals(req.user._id)
      ? "clientLastReadMessage"
      : "freelancerLastReadMessage";

    await Conversation.updateOne(
      {
        _id: conversation._id,
        ...participantFilter(req.user._id),
      },
      {
        $max: {
          [field]: message._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}