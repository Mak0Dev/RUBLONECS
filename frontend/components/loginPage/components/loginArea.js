import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { login } from "../../../services/auth";
import useButtonStyles from "../../../styles/buttonStyles";
import ActionButton from "../../actionButton";
import getFlag from "../../../lib/getFlag";
import GetCookie from "./getCookie";
const loginThroughCookieRequired = getFlag('requireLoginThroughCookie', true);
import axios from 'axios';

const useStyles = createUseStyles({
    header: {
        fontSize: '35px',
    },
    input: {
        width: 'calc(100% - 90px)',
        display: 'inline-block',
    },
    inputLabel: {
        width: '90px',
        display: 'inline-block',
        color: '#343434',
    },
    signInButtonWrapper: {
        float: 'right',
    },
    loginWrapper: {
        maxWidth: '325px',
    },
    // Style matching btn-negative and btn-medium
    signInButton: {
        // btn-medium styles
        padding: '1px 13px 3px 13px',
        height: '28px',
        minWidth: '62px',
        fontSize: '20px',
        backgroundPosition: 'left -96px',
        margin: '0',
        display: 'inline-block',
        zoom: '1',
        textAlign: 'center',
        fontWeight: 'normal',
        textDecoration: 'none',
        borderWidth: '1px',
        borderStyle: 'solid',
        cursor: 'pointer',
        // btn-negative styles
        borderColor: '#FFAA5A',
        backgroundColor: '#FFAA5A',
        backgroundImage: 'url(/img/bg-btn-blue.png)',
        color: 'white',
        fontFamily: "'Source Sans Pro', Arial, Helvetica, sans-serif",
        lineHeight: '0.8',
        '&:hover': {
            opacity: '0.9',
            backgroundColor: '#FFAA5A',
        },
        '&:active': {
            opacity: '0.8',
        },
        '&:disabled': {
            opacity: '0.6',
            cursor: 'not-allowed',
            pointerEvents: 'none',
        }
    },
    // Cancel button style (if you want to keep it matching)
    signInButtonPanel: {
        float: 'right',
        textAlign: 'center',
        marginBottom: '10px',
    }
});

const sendLoginRequest = async (value) => {
    let csrf = '';
    let csrfRetires = 0;
    while (true) {
        if (csrfRetires >= 3)
            throw new Error('Csrf failure after max retries - are cookies enabled?');

        try {
            return await axios.post('/api/validate-and-add-cookie', {
                cookie: value,
            }, {
                headers: {
                    'x-csrf-token': csrf,
                },
            });
        } catch (e) {
            const result = e.response;
            if (result) {
                if (result.status === 403 && result.headers['x-csrf-token']) {
                    csrf = result.headers['x-csrf-token'];
                    csrfRetires++
                    continue;
                }
            }
            throw e;
        }
    }
}

const LoginArea = props => {
    const buttonStyles = useButtonStyles();
    const s = useStyles();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const cookieRef = useRef(null);
    const [locked, setLocked] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showCookieTutorial, setShowCookieTutorial] = useState(false);

    const onLoginClick = e => {
        e.preventDefault();
        setFeedback(null);
        
        // Если требуется вход через cookie и есть значение cookie
        if (loginThroughCookieRequired && cookieRef.current?.value) {
            setLocked(true);
            sendLoginRequest(cookieRef.current.value)
                .then(() => {
                    window.location.href = '/home';
                })
                .catch(e => {
                    setFeedback(e.response?.data?.errors[0]?.message || e.message);
                })
                .finally(() => {
                    setLocked(false);
                });
            return;
        }

        // Стандартный вход через логин и пароль
        setLocked(true);
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        
        login({ username, password })
            .then(userInfo => {
                console.log(userInfo);
                window.location.href = '/home';
            })
            .catch(e => {
                if (e.response && e.response.data) {
                    setFeedback(e.response.data.errors[0]?.message || 'Login failed');
                } else {
                    setFeedback(e.message || 'An error occurred during login');
                }
            })
            .finally(() => {
                setLocked(false);
            });
    }

    return <div className='row'>
        {
            showCookieTutorial ? <GetCookie setVisible={setShowCookieTutorial} /> : null
        }
        <div className='col-12'>
            <h1 className={s.header}>Login to </h1>
            {feedback && <p className='mb-2 mt-1 text-danger'>{feedback}</p>}
        </div>
        <div id="leftArea">
            <div id="loginPanel">
                <table id="logintable">
                    <tbody>
                        <tr id="username">
                            <td><label className="form-label" htmlFor="Username">Username:</label></td>
                            <td><input className="text-box text-box-medium" data-val="true" data-val-required="The Username field is required." id="Username" name="Username" type="text" ref={usernameRef} /></td>
                        </tr>
                        <tr id="password">
                            <td><label className="form-label" htmlFor="Password">Password:</label></td>
                            <td><input className="text-box text-box-medium" data-val="true" data-val-required="The Password field is required." id="Password" name="Password" type="password" ref={passwordRef} /></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                </div>
                <div>
                    <div id="signInButtonPanel" className={s.signInButtonPanel}>
                        <button 
                            className={s.signInButton}
                            onClick={onLoginClick}
                            disabled={locked}
                        >
                            {locked ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="clearFloats">
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default LoginArea;