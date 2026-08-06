import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from 'axios'
import { BACKEND_URL } from "@/config";
import { useNavigate } from "react-router";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

async function signup({ username, password }: { username: String, password: string }) {
  const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
    username,
    password,
  });

  return response.data; // {id: aefesfasdfasdfasfsdf}
}

const Signup = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log(data)
    },
  })

  return (
    <div className="min-h-screen min-w-screen flex">
      <div className="flex-1 min-h-screen bg-black">

      </div>
      <div className="flex-1 min-h-screen flex justify-center items-center">
        <Card className="p-8">
          <Input placeholder="username" onChange={(e) => setUsername(e.target.value)}>

          </Input>

          <Input placeholder="password" onChange={(e) => setPassword(e.target.value)}>

          </Input>

          <Button onClick={() => {
            try {
              // 630854 DAC NO
              mutation.mutate({username, password});
              navigate('/signin')
            } catch (error) {
              alert("error while signing up")
            }
          }} variant={'outline'} className="bg-green-300 cursor-pointer">
            Signup
          </Button>
        </Card>
      </div>
    </div>
  )
};

export default Signup;
