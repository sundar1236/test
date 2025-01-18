import React from 'react'
import author from "../../../assets/images/blog/author.jpg"
import { RiReplyLine } from '@remixicon/react'
const Comments = () => {
    return (
        <div className="post-comments-area">
            <h2>Comments</h2>
            <Card src={author} date={"Jun, 2026"} name={"Admin"} comment={"Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipi scing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. "} />
            <Card src={author} date={"Jun, 2026"} name={"Admin"} comment={"Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipi scing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. "} />

            <div className="comment-form-area">
                <div className="row">
                    <div className="form-group col-md-6">
                        <input type="text" name="name" className="form-control" placeholder="* Name" required="required" />
                    </div>
                    <div className="form-group col-md-6">
                        <input type="email" name="email" className="form-control" placeholder="* Email" required="required" />
                    </div>
                    <div className="form-group col-md-12">
                        <textarea rows="6" name="message" className="form-control" placeholder="* Comment" required="required"></textarea>
                    </div>
                    <div className="col-md-12">
                        <button>Submit Comment</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comments

const Card = ({src, date, name, comment}) => {
    return (
        <div className="single-comment">
            <img src={src} alt="" />
            <h5>{name} - {date}</h5>
            <p>{comment}</p>
            <a href="#"><i><RiReplyLine size={16}/></i> Reply</a>
        </div>
    )
}