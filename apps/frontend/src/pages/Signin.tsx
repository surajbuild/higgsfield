import { BACKEND_URL } from "@/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Signin = {
    username: string,
    password: string,
}
async function signin({ username, password }: Signin) {
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
    })


    return response.data; // {token: fasfaszfkjs, user: {id, username}}
}
const Signin = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: signin,
        onSuccess: (data) => {
            console.log(data.token)
            
            // localStorage.setItem('token', data.token)
            navigate('/dashboard')
        },
        onError: (error) => {
            console.log(error)
            alert('error while signing in')
        }
    })

    return (
        <div className="flex justify-center items-center flex-col min-h-screen">
            <Card className="w-full max-w-sm p-4">
                <Input placeholder="username" onChange={(e) => setUsername(e.target.value)} />

                <Input placeholder="password" onChange={(e) => setPassword(e.target.value)} />

                <Button onClick={() => {
                    mutation.mutate({ username, password })
                }} variant={'outline'} className="cursor-pointer bg-green-300">Signin</Button>
            </Card>
        </div>
    );
};

export default Signin;
