import React from 'react'
import { ScrollRestoration } from 'react-router-dom'
import PageHeading from '../components/sections/pageHeading'
import BlogList from '../components/sections/blog/blogList'
import CallToAction from '../components/sections/callToAction'

const Blog = () => {
    return (
        <>
            <PageHeading
                heading={"Blog"}
                description={"I write about design, productivity, tech and my creative process. Subscribe to my newsletter to stay in touch. I sync once a month with no spam and ads."}
            />
            <BlogList />
            <CallToAction />
            <ScrollRestoration />
        </>
    )
}

export default Blog