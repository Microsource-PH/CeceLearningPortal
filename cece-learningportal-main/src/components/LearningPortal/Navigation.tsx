import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  User, 
  Users, 
  BarChart3, 
  Shield, 
  LogOut,
  Settings,
  Crown,
  GraduationCap,
  Search,
  Bell,
  Zap
} from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export const Navigation = () => {
  const { user, logout, isAuthenticated, updateUserRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { label: "Home", icon: Home, href: "/" },
        { label: "Marketplace", icon: BookOpen, href: "/marketplace" },
        { label: "Pricing", icon: Crown, href: "/pricing" },
      ];
    }

    switch (user?.role) {
      case 'Student':
        return [
          { label: "Dashboard", icon: Home, href: "/" },
          { label: "My Learning", icon: Zap, href: "/learning-dashboard" },
          { label: "Marketplace", icon: BookOpen, href: "/marketplace" },
          { label: "Pricing", icon: Crown, href: "/pricing" },
          { label: "Profile", icon: User, href: "/profile" },
        ];
      case 'Instructor':
      case 'Creator':
        return [
          { label: "Dashboard", icon: Home, href: "/" },
          { label: "Marketplace", icon: BookOpen, href: "/marketplace" },
          { label: "Profile", icon: User, href: "/profile" },
        ];
      case 'Admin':
        return [
          { label: "Dashboard", icon: Home, href: "/" },
          { label: "Marketplace", icon: BookOpen, href: "/marketplace" },
          { label: "Admin Panel", icon: Shield, href: "/admin" },
          { label: "Profile", icon: User, href: "/profile" },
        ];
      default:
        return [
          { label: "Dashboard", icon: Home, href: "/" },
          { label: "Marketplace", icon: BookOpen, href: "/marketplace" },
        ];
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    updateUserRole?.(newRole);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAuthAction = () => {
    navigate('/login');
  };

  // Only admins can switch between all roles
  // Learners and Instructors can only use their assigned role
  const canSwitchRoles = user?.role === 'Admin';
  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CECE
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 transition-colors ${
                  isActive(item.href) 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-learning-warning"></Badge>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Role Selector - Only for Admin */}
                {canSwitchRoles && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Role:</span>
                    <Select value={user?.role} onValueChange={(value) => handleRoleSwitch(value as UserRole)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Student
                          </div>
                        </SelectItem>
                        <SelectItem value="Instructor">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Instructor
                          </div>
                        </SelectItem>
                        <SelectItem value="Admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="secondary" className="w-fit mt-1 capitalize">
                          {user?.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleAuthAction}>Sign In</Button>
                <Button size="sm" onClick={handleAuthAction}>Get Started</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Mobile Role Selector - Only for Admin */}
              {canSwitchRoles && isAuthenticated && (
                <div className="px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Switch Role:</span>
                  </div>
                  <Select value={user?.role} onValueChange={(value) => handleRoleSwitch(value as UserRole)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="Instructor">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Instructor
                        </div>
                      </SelectItem>
                      <SelectItem value="Admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? "text-primary bg-accent font-medium"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile User Section */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-muted-foreground capitalize">
                        {user?.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 px-3 mt-2">
                    <Button variant="ghost" size="sm" className="flex-1" asChild>
                      <Link to="/profile">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full bg-destructive/10 hover:bg-destructive hover:text-white transition-colors" 
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};