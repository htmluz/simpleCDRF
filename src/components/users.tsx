import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { getTokens, getUserName, getUserRole } from "@/lib/auth";
import Success from "./ui/success";
import Failure from "./ui/failure";
import { Plus, UserPen, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface User {
  username: string | null;
  role: string | null;
}

interface UserChange {
  username: string | undefined;
  role: string | null | undefined;
  password: string | undefined;
}

export default function UserSettings() {
  const [usersData, setUsersData] = useState<User[] | null>(null);
  const [userOwnInfo, setUserOwnInfo] = useState<User | null>(null);
  const [userChange, setUserChange] = useState<UserChange | null>(null);
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "loading"
  >("idle");
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  const fetchUsersData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const result: User[] = await response.json();
      setUsersData(result);
    } catch (error) {
      console.error("Erro buscando users: ", error);
      setStatus("failure");
      resetStatus();
    } finally {
      setStatus("idle");
      resetStatus();
    }
  };

  useEffect(() => {
    const { access_token } = getTokens();
    const user = getUserName(access_token);
    const role = getUserRole(access_token);
    setUserOwnInfo({ username: user, role: role });
    if (user) {
      setUserChange({ username: user, role: role, password: "" });
    }
    fetchUsersData();
  }, []);

  const handleInputChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setIsChanged(true);
    setUserChange((prev) => (prev ? { ...prev, username: d } : prev));
  };
  const handleInputChangePass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setIsChanged(true);
    setUserChange((prev) => (prev ? { ...prev, password: d } : prev));
  };
  const handleRoleChange = (value: string) => {
    setUserChange((prev) => ({ ...prev, role: value } as UserChange));
  };
  const handleEditUser = (user: string | null, r: string | null) => {
    if (user && r) {
      setUserChange({ username: user, role: r, password: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      usersData?.some(
        (u) =>
          u.username === userChange?.username && userOwnInfo?.role === "abc"
      )
    ) {
      //alterando role
      try {
        setStatus("loading");
      } catch (error) {
        console.error(error);
      }
    } else if (
      userChange?.password !== "" &&
      usersData?.some((u) => u.username === userChange?.username)
    ) {
      //alterando só senha
      try {
        setStatus("loading");
        const r = await fetch(`${API_BASE_URL}/user/password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userChange?.username,
            password: userChange?.password,
          }),
        });
        if (r.ok) {
          setStatus("success");
          resetStatus();
        } else {
          setStatus("failure");
          resetStatus();
        }
      } catch (error) {
        setStatus("failure");
        resetStatus();
        console.error(error);
      }
    } else {
      //novo usuario
      try {
        setStatus("loading");
        const r = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userChange?.username,
            password: userChange?.password,
            role: userChange?.role,
          }),
        });
        if (r.ok) {
          setStatus("success");
          resetStatus();
        } else {
          setStatus("failure");
          resetStatus();
        }
      } catch (error) {
        setStatus("failure");
        resetStatus();
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, []);

  return (
    <div className="max-w-full mx-auto px-4 py-0 font-mono">
      {/* Edit/Create User Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl m-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">
                {usersData?.some((u) => u.username === userChange?.username)
                  ? "Editar Usuário"
                  : "Criar Usuário"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Usuário
                  </label>
                  <Input
                    type="text"
                    onChange={handleInputChangeUser}
                    value={userChange?.username}
                    placeholder="Digite o usuário"
                    required
                    disabled={userOwnInfo?.role !== "admin"}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Senha
                  </label>
                  <Input
                    type="password"
                    onChange={handleInputChangePass}
                    value={userChange?.password}
                    required={userOwnInfo?.role === "user"}
                    placeholder="Digite a senha"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Permissão
                  </label>
                  <Select
                    onValueChange={handleRoleChange}
                    disabled={userOwnInfo?.role !== "admin"}
                    defaultValue="user"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{userChange?.role}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                {status === "idle" ? (
                  <Button type="submit" disabled={!isChanged}>
                    {usersData?.some((u) => u.username === userChange?.username)
                      ? "Salvar Mudanças"
                      : "Criar Usuário"}
                  </Button>
                ) : status === "success" ? (
                  <Success />
                ) : (
                  <Failure />
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Add User Card */}
        {userOwnInfo?.role === "admin" && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setUserChange({ username: "", role: "user", password: "" });
            }}
            className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex items-center justify-center group"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                Adicionar Novo Usuário
              </p>
            </div>
          </button>
        )}

        {/* User Cards */}
        {usersData?.map((user, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 dark:hover:border-neutral-700 p-6 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{user.username}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {user.role}
                </p>
              </div>
              {userOwnInfo?.role === "admin" ||
                (userOwnInfo?.username == user.username && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleEditUser(user.username, user.role);
                      setIsEditing(true);
                    }}
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <UserPen className="w-4 h-4" />
                  </Button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
