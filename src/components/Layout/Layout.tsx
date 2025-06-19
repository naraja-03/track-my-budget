import { ReactNode } from "react";
import { useRouter } from "next/router";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const router = useRouter();
    const is404Page = router.pathname === "/404";

    if (is404Page) {
        return <>{children}</>;
    }

    return (
        <>
            <div className=" bg-gray-100  px-4 flex-grow">
                {children}
            </div>
        </>
    );
}

export default Layout;
