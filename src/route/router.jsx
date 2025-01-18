import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/root";
import Home from "../pages/home";
import Contact from "../pages/contact";
import About from "../pages/about";
import SingleProject from "../pages/single-project";
import Projects from "../pages/projects";
import Blog from "../pages/blog";
import SingleBlog from "../pages/single-blog";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/contact",
                element: <Contact />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/blog",
                element: <Blog />
            },
            {
                path: "/single-project",
                element: <SingleProject />
            },
            {
                path: "/single-blog",
                element: <SingleBlog />
            },
            {
                path: "/projects",
                element: <Projects />
            },
        ]
    }
])