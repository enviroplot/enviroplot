import React from 'react';
import {Container} from 'components/bootstrap';

const NotFoundPage = () => {
  return (
    <Container style={{marginTop: 100}}>
      <h2>Not found</h2>
      <p>Sorry! The page you are looking for could not be found.</p>
    </Container>
  );
};

export default NotFoundPage;
