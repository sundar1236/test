import React from 'react'
import { blogData } from '../../../utlits/fackData/blogData'
import Card from './card'

const BlogList = () => {
    return (
        <div className="blog-area" id="blog">
            <div className="container">
                <div className="row">
                    <div className="blog-list">
                        <div className="col-lg-12">
                            {
                                blogData.map(({ date, id, src, tag, title }) => <Card key={id} date={date} src={src} tag={tag} title={title} />)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogList