import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { LogOut, LayoutDashboard, Sparkles } from "lucide-react";

async function fetchMe() {
  const response = await axios.get(`${BACKEND_URL}/api/v1/me`, {
    withCredentials: true,
  });
  return response.data.user;
}

async function logout() {
  await axios.post(`${BACKEND_URL}/api/v1/logout`, {}, {
    withCredentials: true,
  });
}

export function Appbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  return (
    <div className="flex justify-between items-center p-4 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
      <div
        className="flex items-center gap-2 font-semibold text-lg cursor-pointer"
        onClick={() => navigate("/")}
      >
        <Sparkles className="h-5 w-5" />
        Higgsfield
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {user.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                queryClient.setQueryData(["me"], null);
                queryClient.clear();
                navigate("/");
              }}
              className="gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={"outline"}
              onClick={() => navigate("/signup")}
              className="cursor-pointer"
            >
              Signup
            </Button>
            <Button
              variant={"outline"}
              onClick={() => navigate("/signin")}
              className="cursor-pointer"
            >
              Signin
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Appbar;
