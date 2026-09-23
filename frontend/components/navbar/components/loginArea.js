import React from "react";
import { createUseStyles } from "react-jss";
import { useRouter } from "next/router";

const useLoginAreaStyles = createUseStyles({
  text: {
    color: 'var(--custom-navbar-text, white)',
    fontWeight: 400,
    fontSize: '16px',
    borderBottom: 0,
    marginTop: '2px',
    marginBottom: 0,
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  link: {
    color: 'var(--custom-navbar-text, white)',
    textDecoration: 'none',
    padding: '4px 8px',
    '&:hover': {
      color: 'var(--custom-navbar-text, white)',
      background: 'rgba(25,25,25,0.1)',
      cursor: 'pointer',
      borderRadius: '4px',
    },
  },
});

const LoginArea = () => {
  const router = useRouter();
  const s = useLoginAreaStyles();

  const goTo = (path) => {
    router.push(path);
  };

  return <div className='row'>
    <div className='col-6 offset-6'>
      <div className='row'>
        <div className='col-6'>
          <p className={s.text}>
            <a
              href='/auth/signup'
              className={s.link}
              onClick={(e) => {
                e.preventDefault();
                goTo('/auth/signup');
              }}
            >
              Sign Up
            </a>
          </p>
        </div>
        <div className='col-6'>
          <p className={s.text}>
            <a
              href='/login'
              className={s.link}
              onClick={(e) => {
                e.preventDefault();
                goTo('/login');
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
}

export default LoginArea;
