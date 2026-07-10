import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from "lucide-react";
import { User } from "../types";

type AuthScreenProps = {
  onLogin: (user: User) => void;
};

type RegisteredUser = User & {
  passwordHash: string; // Storing password locally for authentication simulation
};

const USERS_STORAGE_KEY = "taskflow-registered-users";
const avatarColors = [
  "#2563eb", // Blue
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Red
  "#7c3aed", // Violet
  "#db2777", // Pink
  "#0891b2", // Cyan
];

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getRegisteredUsers(): RegisteredUser[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveRegisteredUsers(users: RegisteredUser[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  function getInitials(fullName: string): string {
    return fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Simulate network delay for premium visual feedback
    setTimeout(() => {
      const users = getRegisteredUsers();

      if (isRegister) {
        if (!cleanName) {
          setError("Name is required.");
          setLoading(false);
          return;
        }

        const userExists = users.some((u) => u.email === cleanEmail);
        if (userExists) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }

        // Create new user profile
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
        const initials = getInitials(cleanName);
        const newUser: RegisteredUser = {
          email: cleanEmail,
          name: cleanName,
          avatar: initials,
          color: randomColor,
          passwordHash: password, // simple simulated hashing
        };

        users.push(newUser);
        saveRegisteredUsers(users);

        const publicUser: User = {
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          color: newUser.color,
        };
        setLoading(false);
        onLogin(publicUser);
      } else {
        // Sign In Flow
        const foundUser = users.find((u) => u.email === cleanEmail && u.passwordHash === password);
        if (!foundUser) {
          // Provide default demo admin user for easy access/evaluation
          if (cleanEmail === "admin@taskflow.com" && password === "password") {
            const adminUser: User = {
              email: "admin@taskflow.com",
              name: "Demo Admin",
              avatar: "DA",
              color: "#4f46e5",
            };
            setLoading(false);
            onLogin(adminUser);
            return;
          }

          setError("Invalid email or password.");
          setLoading(false);
          return;
        }

        const publicUser: User = {
          email: foundUser.email,
          name: foundUser.name,
          avatar: foundUser.avatar,
          color: foundUser.color,
        };
        setLoading(false);
        onLogin(publicUser);
      }
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 p-4 transition-colors dark:bg-slate-950">
      {/* Dynamic Ambient Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-violet-400/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Welcome to TaskFlow
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isRegister
              ? "Create your local account to start tracking tasks"
              : "Sign in to manage your workspace projects"}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {isRegister && (
            <label className="field-label">
              Full Name
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="John Doe"
                  className="field-input pl-9"
                  disabled={loading}
                />
              </div>
            </label>
          )}

          <label className="field-label">
            Email Address
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                className="field-input pl-9"
                disabled={loading}
              />
            </div>
          </label>

          <label className="field-label">
            Password
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="field-input px-9"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {/* Demo Hint */}
          {!isRegister && (
            <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400">
              💡 Register a new account locally, or sign in using demo account:
              <br />
              <strong>Email:</strong> admin@taskflow.com | <strong>Pass:</strong> password
            </div>
          )}

          <button
            type="submit"
            className="primary-button h-11 w-full justify-center text-sm font-semibold tracking-wide shadow-md mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isRegister ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setEmail("");
              setPassword("");
              setName("");
            }}
            disabled={loading}
          >
            {isRegister ? "Already have an account? Sign In" : "New to TaskFlow? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
