import axios from "axios";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cookieService } from "../services/cookieService";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import type { User } from "../types/auth";

const API_BASE_URL = 'http://localhost:8080/api';

export default function GoogleAuthCallback() {
  const nav = useNavigate();
  const ran = useRef(false);
  const { setAuth, updateUser } = useAuth();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        console.error("Google OAuth error:", error);
        nav("/login?error=" + encodeURIComponent("Đăng nhập Google thất bại: " + error));
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        nav("/login?error=" + encodeURIComponent("Không nhận được mã xác thực từ Google"));
        return;
      }

      try {
        // Get the redirect URI that was used (must match what was sent to Google)
        const redirectUri = `${window.location.origin}/google-auth-callback`;
        
        const res = await axios.post(`${API_BASE_URL}/auth/google/exchange`, { 
          code, 
          redirectUri 
        });

        if (res.data.state === "SUCCESS" && res.data.object) {
          const auth = res.data.object; // AuthenticationResponse

          // Store tokens first (needed for API calls)
          cookieService.setToken(auth.accessToken);
          cookieService.setRefreshToken(auth.refreshToken);

          // Fetch user profile to ensure we have complete user data
          let finalUser: User | null = null;
          try {
            // Token is now set, so API call should work
            const userProfileResponse = await userAPI.getProfile();
            if (userProfileResponse.state === "200" && userProfileResponse.object) {
              finalUser = userProfileResponse.object;
              // Ensure role is properly formatted as string
              if (finalUser.role && typeof finalUser.role === 'object') {
                finalUser.role = String(finalUser.role);
              }
            } else if (auth.user) {
              // Fallback to user from auth response if profile fetch fails
              finalUser = auth.user as User;
            }
          } catch (profileError) {
            console.warn("Failed to fetch user profile, using auth response user:", profileError);
            // Fallback to user from auth response if profile fetch fails
            if (auth.user) {
              finalUser = auth.user as User;
            }
          }

          // Set authentication state in context (this will update both token and user state)
          if (finalUser) {
            setAuth(auth.accessToken, finalUser);
            // Redirect to home after a short delay to ensure state is updated
            setTimeout(() => {
              nav("/", { replace: true });
            }, 100);
          } else {
            throw new Error("Không thể lấy thông tin người dùng");
          }
        } else {
          throw new Error(res.data.message || "Đăng nhập Google thất bại");
        }
      } catch (e: any) {
        console.error("Google auth callback error:", e);
        const errorMessage = e.response?.data?.message || e.message || "Đăng nhập Google thất bại";
        nav("/login?error=" + encodeURIComponent(errorMessage));
      }
    };

    run();
  }, [nav, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white mb-4"></div>
        <p className="text-white text-lg">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
}
