import { Button } from "./ui/button";

export function Appbar() {
    return (
        <div className="flex justify-between items-center p-4 glass">
            <div>Higgsfield</div>
            <div className="flex justify-between gap-2">
                <Button variant={"outline"}>
                    Signup
                </Button>
                <Button variant={"outline"} className="cursor-pointer">Signin</Button>
            </div>
        </div>
    );
}

export default Appbar;
