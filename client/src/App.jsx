import { Link, Route, Routes } from "react-router";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Overview from "./pages/Overview.jsx";
import Talent from "./pages/Talent.jsx";
import FreelancerProfile from "./pages/FreelancerProfile.jsx";
import Projects from "./pages/Projects.jsx";
import NewProject from "./pages/NewProject.jsx";
import Messages from "./pages/Messages.jsx";
import SavedTalent from "./pages/SavedTalent.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyProfile from "./pages/MyProfile.jsx";
function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="talent" element={<Talent />} />

        <Route
          path="talent/:freelancerId"
          element={<FreelancerProfile />}
        />

        <Route path="saved" element={<SavedTalent />} />

       <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
      <Route path="projects" element={<Projects />} />
      <Route path="projects/new" element={<NewProject />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["freelancer"]} />}>
      <Route path="my-profile" element={<MyProfile />} />
      </Route>

     <Route element={<ProtectedRoute />}>
    <Route path="messages" element={<Messages />} />
    </Route>

        <Route
          path="*"
          element={
            <section>
              <h1 className="text-3xl font-semibold">
                Page not found
              </h1>

              <Link
                to="/"
                className="mt-5 inline-block text-violet-700 underline"
              >
                Return to overview
              </Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;