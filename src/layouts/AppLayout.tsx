import MessagingWidget from "@/components/custom/MessagingWidget"
import TopBar from "@/components/custom/TopBar"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
    const userName = "Admin" // Replace with actual context or state later

    return (
        <div className="">
            <TopBar userName={userName} />
            <main className="pt-20 p-6">
                <Outlet />
                <MessagingWidget />
            </main>
        </div>
    )
}