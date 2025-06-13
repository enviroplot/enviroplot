import React from 'react';
import {useSelector} from 'react-redux';
import {Nav, Navbar} from 'components/bootstrap';
import {Link, useLocation} from 'react-router-dom';
import PropTypes from 'prop-types';

import utils from 'utils';

import {isAssessmentTypeSelected} from 'reducers/sessionReducer';

Navigation.propTypes = {
  routTo: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

const isDev = utils.loadModule('electron-is-dev');

function Navigation() {
  const isAssessmentType = useSelector((state: any) => isAssessmentTypeSelected(state))();

  const location = useLocation();

  const path = location.pathname;

  const LinkItemTo = (props) => (
    <Nav.Item>
      <Nav.Link as={Link} to={props.routTo} active={path === props.routTo} disabled={props.disabled}>
        {props.label}
      </Nav.Link>
    </Nav.Item>
  );

  return (
    <Navbar bg="light" variant="light" expand="md">
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav variant="tabs">
          <LinkItemTo routTo="/" label="Home" />
          <LinkItemTo routTo="/samples" label="Samples" disabled={!isAssessmentType} />
          <LinkItemTo routTo="/results" label="Results" disabled={!isAssessmentType} />
          {isDev && <LinkItemTo routTo="/test" label="Test" />}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
