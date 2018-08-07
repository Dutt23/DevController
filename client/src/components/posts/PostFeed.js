import React, { Component } from "react";
import PropTypes from "prop-types";
import PostItem from "./PostItem";
import { connect } from "react-redux";
class PostFeed extends Component {
  render() {
    const { posts, auth } = this.props;
    const { user } = this.props.auth;
    return posts.map(post => (
      <PostItem key={post._id} post={post} />
    ));
  }
}

PostFeed.propTypes = {
  posts: PropTypes.array.isRequired,
  auth: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PostFeed);
