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
import { UserPen } from "lucide-react";

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

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  const fetchUsersData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`http://10.90.0.100:5000/users`);
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
        const r = await fetch("http://10.90.0.100:5000/user/password", {
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
        const r = await fetch("http://10.90.0.100:5000/register", {
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
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            onChange={handleInputChangeUser}
            value={userChange?.username}
            placeholder="Usuário"
            required
            disabled={userOwnInfo?.role !== "admin"}
          ></Input>
          <Input
            type="password"
            onChange={handleInputChangePass}
            value={userChange?.password}
            required={userOwnInfo?.role === "user"}
            placeholder="Senha"
          ></Input>
          <Select
            onValueChange={handleRoleChange}
            disabled={userOwnInfo?.role !== "admin"}
            defaultValue="user"
          >
            <SelectTrigger className="w-1/5" id="select-15">
              <SelectValue>{userChange?.role}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {status === "idle" ? (
            <>
              {userOwnInfo?.username == userChange?.username ? (
                <Button type="submit" disabled={!isChanged}>
                  Atualizar
                </Button>
              ) : usersData?.some(
                  (u) => u.username === userChange?.username
                ) ? (
                <Button type="submit" disabled={!isChanged}>
                  Atualizar
                </Button>
              ) : (
                <Button type="submit" disabled={!isChanged}>
                  Criar Usuário
                </Button>
              )}
            </>
          ) : status === "success" ? (
            <Success />
          ) : (
            <Failure />
          )}
        </div>
      </form>
      <div className="bg-gray-100 dark:bg-neutral-900 rounded-lg shadow-inner h-[90%] px-2">
        {usersData && usersData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="">
                <th className="text-start w-[30%]">Usuário</th>
                <th className="text-start w-[10%]">Grupo</th>
                <th className="text-start"></th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors rounded-xl hover:shadow-sm select-none"
                >
                  <td className="py-1 text-neutral-800 dark:text-neutral-200">
                    {user.username}
                  </td>
                  <td className="text-neutral-800 dark:text-neutral-200">
                    {user.role}
                  </td>
                  <td>
                    {userOwnInfo?.role === "admin" && (
                      <UserPen
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                        onClick={() => handleEditUser(user.username, user.role)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>não tem</p>
        )}
      </div>
    </>
  );
}
