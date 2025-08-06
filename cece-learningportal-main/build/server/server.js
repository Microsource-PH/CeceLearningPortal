var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs } from "react/jsx-runtime";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import * as React from "react";
import { createContext, useState, useEffect } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, context, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const createMockClient = () => {
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    gte: () => mockQuery,
    lt: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    is: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    containedBy: () => mockQuery,
    range: () => mockQuery,
    overlaps: () => mockQuery,
    match: () => mockQuery,
    not: () => mockQuery,
    or: () => mockQuery,
    filter: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    count: () => mockQuery,
    then: (resolve) => resolve({ data: [], error: null, count: 0 })
  };
  return {
    from: () => mockQuery,
    functions: {
      invoke: () => Promise.resolve({ data: null, error: "Supabase not configured" })
    },
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: { user: null, session: null },
        error: { message: "Mock auth: use the mock login credentials" }
      }),
      signUp: () => Promise.resolve({
        data: { user: null, session: null },
        error: { message: "Mock auth: registration not available in demo" }
      }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};
const supabase = createMockClient();
const API_BASE_URL = "http://localhost:5295/api";
const SUPABASE_URL = void 0;
const USE_POSTGRES = true;
class ApiService {
  constructor() {
    __publicField(this, "token", null);
  }
  setToken(token) {
    this.token = token;
  }
  async request(url, options = {}) {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });
      if (!response.ok) {
        let error = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          error = errorData.message || errorData.error || error;
        } catch {
          const errorText = await response.text();
          if (errorText) error = errorText;
        }
        return { error };
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  // Auth endpoints
  async register(email, password, fullName, role = "Learner") {
    try {
      if (USE_POSTGRES) {
        return this.request("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName, role })
        });
      }
      const { data, error } = await supabase.functions.invoke("auth-register", {
        body: { email, password, fullName, role }
      });
      if (error) {
        return { error: error.message };
      }
      return { data };
    } catch (error) {
      {
        if (email && password && fullName) {
          return {
            data: {
              id: crypto.randomUUID(),
              email,
              fullName,
              role,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
              accessToken: `mock-token-${Date.now()}`,
              refreshToken: `mock-refresh-${Date.now()}`
            }
          };
        }
        return { error: "All fields are required" };
      }
    }
  }
  async login(email, password) {
    var _a, _b;
    try {
      if (USE_POSTGRES) {
        return this.request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
      }
      if (!SUPABASE_URL || SUPABASE_URL === "https://placeholder.supabase.co" || SUPABASE_URL.includes("placeholder")) {
        const mockUsers = {
          "instructor@example.com": {
            id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
            email: "instructor@example.com",
            fullName: "Dr. Sarah Johnson",
            role: "Creator",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format",
            accessToken: "mock-token-instructor",
            refreshToken: "mock-refresh-instructor"
          },
          "student@example.com": {
            id: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
            email: "student@example.com",
            fullName: "John Smith",
            role: "Learner",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
            accessToken: "mock-token-student",
            refreshToken: "mock-refresh-student"
          },
          "admin@example.com": {
            id: "d7a3c5e4-5f2b-4a8c-9e1d-3b2a1c0d9e8f",
            email: "admin@example.com",
            fullName: "Michael Chen",
            role: "Admin",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
            accessToken: "mock-token-admin",
            refreshToken: "mock-refresh-admin"
          }
        };
        if (mockUsers[email] && password === "password") {
          return { data: mockUsers[email] };
        }
        return { error: "Invalid credentials" };
      }
      const { data, error } = await supabase.functions.invoke("auth-login", {
        body: { email, password }
      });
      if (error) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          return { error: signInError.message };
        }
        if (signInData.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", signInData.user.id).single();
          return {
            data: {
              id: signInData.user.id,
              email: signInData.user.email,
              fullName: (profile == null ? void 0 : profile.full_name) || "User",
              role: (profile == null ? void 0 : profile.role) || "Learner",
              avatar: profile == null ? void 0 : profile.avatar_url,
              accessToken: ((_a = signInData.session) == null ? void 0 : _a.access_token) || "",
              refreshToken: ((_b = signInData.session) == null ? void 0 : _b.refresh_token) || ""
            }
          };
        }
      }
      return { data };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error instanceof Error ? error.message : "Login failed" };
    }
  }
  async logout() {
    return this.request("/auth/logout", {
      method: "POST"
    });
  }
  // Course endpoints
  async getCourses(params) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request(`/courses${queryString}`);
  }
  async getCourse(id) {
    return this.request(`/courses/${id}`);
  }
  async createCourse(courseData) {
    return this.request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData)
    });
  }
  async updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData)
    });
  }
  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: "DELETE"
    });
  }
  // Enrollment endpoints
  async enrollInCourse(courseId) {
    return this.request(`/enrollments/courses/${courseId}`, {
      method: "POST"
    });
  }
  async getMyEnrollments() {
    return this.request("/enrollments");
  }
  async updateLessonProgress(lessonId, status) {
    return this.request(`/enrollments/lessons/${lessonId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  }
  // User endpoints
  async getUser(id) {
    return this.request(`/users/${id}`);
  }
  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData)
    });
  }
  async changePassword(data) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async getUserStats(id) {
    return this.request(`/users/${id}/stats`);
  }
  async getUserCertificates(id) {
    return this.request(`/users/${id}/certificates`);
  }
  async getActivityHistory(id) {
    return this.request(`/users/${id}/activity`);
  }
  async uploadAvatar(formData) {
    return this.request("/users/avatar", {
      method: "POST",
      headers: {
        // Remove Content-Type to let browser set it with boundary
      },
      body: formData
    });
  }
}
const api = new ApiService();
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const migrateRole = (role) => {
    switch (role) {
      case "Student":
        return "Learner";
      case "Instructor":
        return "Creator";
      case "Admin":
        return "Admin";
      default:
        return role;
    }
  };
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        const migratedRole = migrateRole(authData.role);
        if (migratedRole !== authData.role) {
          authData.role = migratedRole;
          localStorage.setItem("auth", JSON.stringify(authData));
        }
        setUser({
          id: authData.id,
          name: authData.fullName,
          email: authData.email,
          role: migratedRole,
          avatar: authData.avatar,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        });
        api.setToken(authData.accessToken);
      } catch (error) {
        console.error("Failed to parse saved auth:", error);
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);
  }, []);
  const isAuthenticated = !!user;
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      if (response.error) {
        return { success: false, error: response.error };
      }
      const authData = response.data;
      const migratedRole = migrateRole(authData.role);
      const userData = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken
      };
      setUser(userData);
      api.setToken(authData.accessToken);
      localStorage.setItem("auth", JSON.stringify(authData));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };
  const register = async (email, password, fullName, role = "Learner") => {
    try {
      const response = await api.register(email, password, fullName, role);
      if (response.error) {
        return { success: false, error: response.error };
      }
      const authData = response.data;
      const migratedRole = migrateRole(authData.role);
      const userData = {
        id: authData.id,
        name: authData.fullName,
        email: authData.email,
        role: migratedRole,
        avatar: authData.avatar,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken
      };
      setUser(userData);
      api.setToken(authData.accessToken);
      localStorage.setItem("auth", JSON.stringify(authData));
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed. Please try again." };
    }
  };
  const logout = async () => {
    try {
      if (user == null ? void 0 : user.accessToken) {
        await api.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem("auth");
    }
  };
  const switchRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        authData.role = role;
        localStorage.setItem("auth", JSON.stringify(authData));
      }
    }
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateUserRole: switchRole
      },
      children
    }
  );
};
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    ToastPrimitives.Root,
    {
      ref,
      className: cn(toastVariants({ variant }), className),
      ...props
    }
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Description,
  {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const links = () => [{
  rel: "icon",
  href: "/favicon.ico"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs(AuthProvider, {
    children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {})]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BfMRafVI.js", "imports": ["/assets/chunk-C37GKA54-BGdOS2fn.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-BrkgGLcI.js", "imports": ["/assets/chunk-C37GKA54-BGdOS2fn.js"], "css": ["/assets/root-Bi-3RJP6.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-c30b2dce.js", "version": "c30b2dce", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
