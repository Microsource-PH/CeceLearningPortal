import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Marketplace from "./pages/Marketplace";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import MyCourses from "./pages/MyCourses";
import LearningDashboard from "./pages/LearningDashboard";
import CourseDetail from "./pages/CourseDetail";
import CourseLearning from "./pages/learn/CourseLearning";
import CourseAnalyticsPage from "./pages/CourseAnalyticsPage";
import HubLanding from "./pages/hub/HubLanding";
import HubLayout from "./pages/hub/HubLayout";
import HubAbout from "./pages/hub/HubAbout";
import DirectoryList from "./pages/hub/DirectoryList";
import SectionListing from "./pages/hub/SectionListing";
import ResourceDetail from "./pages/hub/ResourceDetail";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import DirectorySubmit from "./pages/hub/DirectorySubmit";
import HubAboutAdmin from "./pages/hub/HubAboutAdmin";
import HubSearch from "./pages/hub/HubSearch";
import ResourceCenter from "./pages/hub/ResourceCenter";
import ResourcesList from "./pages/hub/ResourcesList";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/edit/:id" element={<Marketplace />} />
              <Route
                path="/analytics/course/:id"
                element={<CourseAnalyticsPage />}
              />
              <Route
                path="/learn/course/:courseId"
                element={<CourseLearning />}
              />
              <Route path="/pricing" element={<Pricing />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route
                path="/affiliate"
                element={
                  <ProtectedRoute allowedRoles={["Learner"]}>
                    <AffiliateDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Resource Hub (nested layout remains scoped to /hub) */}
              <Route path="/hub" element={<HubLayout />}>
                <Route index element={<HubLanding />} />
                <Route path="about" element={<HubAbout />} />
                <Route path="search" element={<HubSearch />} />
                <Route path="resource-center" element={<ResourceCenter />} />
                <Route path="resources" element={<ResourcesList />} />
                <Route
                  path="about/admin"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <HubAboutAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route path="directory" element={<DirectoryList />} />
                <Route
                  path="directory/submit"
                  element={
                    <ProtectedRoute>
                      <DirectorySubmit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="sections/:sectionSlug"
                  element={<SectionListing />}
                />
                <Route
                  path="resources/:resourceSlug"
                  element={<ResourceDetail />}
                />
              </Route>

              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning-dashboard"
                element={
                  <ProtectedRoute>
                    <LearningDashboard />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
