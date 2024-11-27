import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Button } from "./ui/button";
import { getTokens, getUserName, getUserRole } from "@/lib/auth";

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

  const fetchUsersData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`http://192.168.65.157:5000/users`);
      const result: User[] = await response.json();
      setUsersData(result);
    } catch (error) {
      console.error("Erro buscando users: ", error);
    } finally {
      setStatus("idle");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userOwnInfo?.role === "admin") {
      //alterar proprio user todos podem
      //só pode alterar a senha
      try {
        setStatus("loading");
        const r = await fetch("http://192.168.65.157:5000/users/password", {
          method: "POST",
          headers: { "Coontent-Type": "application/json" },
          body: JSON.stringify({
            username: userChange?.username,
            password: userChange?.password,
          }),
        });
        console.log(r);
        if (r.ok) {
          setStatus("success");
        } else {
          setStatus("failure");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      //alterar roles proprios ou de outros users
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-6">
          <Input
            type="text"
            onChange={handleInputChangeUser}
            value={userChange?.username}
            placeholder="Usuário"
            disabled={userOwnInfo?.role !== "admin"}
          ></Input>
          <Input
            type="password"
            onChange={handleInputChangePass}
            value={userChange?.password}
            placeholder="Senha"
          ></Input>
          <Select disabled={userOwnInfo?.role !== "admin"} defaultValue="Grupo">
            <SelectTrigger className="w-1/5" id="select-15"></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {userOwnInfo?.username == userChange?.username ? (
            <Button type="submit" disabled={!isChanged}>
              Atualizar
            </Button>
          ) : usersData?.some((u) => u.username === userChange?.username) ? (
            <Button type="submit" disabled={!isChanged}>
              Atualizar
            </Button>
          ) : (
            <Button type="submit" disabled={!isChanged}>
              Criar Usuário
            </Button>
          )}
        </div>
      </form>
      <div className="bg-gray-100 rounded-lg shadow-inner h-[90%] px-2">
        {usersData && usersData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="">
                <th className="text-start w-[30%]">Usuário</th>
                <th className="text-start w-[10%]">Grupo</th>
                <th className="text-start">i</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-200 transition-colors rounded-xl hover:shadow-sm select-none"
                >
                  <td className="py-1">{user.username}</td>
                  <td>{user.role}</td>
                  <td>e</td>
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
