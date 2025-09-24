import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import HubAbout from "./pages/hub/HubAbout";
import DirectoryList from "./pages/hub/DirectoryList";
import SectionListing from "./pages/hub/SectionListing";
import ResourceDetail from "./pages/hub/ResourceDetail";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import DirectorySubmit from "./pages/hub/DirectorySubmit";
import HubAboutAdmin from "./pages/hub/HubAboutAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/affiliate" element={<AffiliateDashboard />} />
            {/* Resource Hub */}
            <Route path="/hub" element={<HubLanding />} />
            <Route path="/hub/about" element={<HubAbout />} />
            <Route path="/hub/about/admin" element={<HubAboutAdmin />} />
            <Route path="/hub/directory" element={<DirectoryList />} />
            <Route path="/hub/directory/submit" element={<DirectorySubmit />} />
            <Route
              path="/hub/sections/:sectionSlug"
              element={<SectionListing />}
            />
            <Route
              path="/hub/resources/:resourceSlug"
              element={<ResourceDetail />}
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/learning-dashboard" element={<LearningDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
