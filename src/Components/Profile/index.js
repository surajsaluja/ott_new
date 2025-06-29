import React, { useEffect } from 'react'
import { useUserContext } from '../../Context/userContext'
import { FocusContext, setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import './index.css'
import FocusableButton from '../Common/FocusableButton';
import { kableOneLogo } from '../../assets';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { CACHE_KEYS, SCREEN_KEYS, setCache } from '../../Utils/DataCache';

function ProfileHomePage({ focusKey }) {
    const { isLoggedIn, uid, profileInfo, logout } = useUserContext();
    const history = useHistory();
    const { ref,  focusKey : currentFocusKey, focusSelf } = useFocusable({ focusKey });
    useEffect(()=>{
        focusSelf();
    },[focusSelf])
    
    useEffect(()=>{
        setCache(CACHE_KEYS.CURRENT_SCREEN,SCREEN_KEYS.HOME.PROFILE_HOME_PAGE);
    },[])
    
    function getFormattedDate(dateString) {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    const loginButtonEnterPressHandler = () =>{
        if(isLoggedIn){
            logout();
        }else{
            history.push('/login');
        }
    }

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className='profile-container' ref={ref}>
                {isLoggedIn ? (<>
                    <h2 className="profile-heading">PROFILE</h2>
                    <table className="profile-table">
                        <tbody>
                            <tr>
                                <td>User Name</td>
                                <td>{profileInfo.username}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{profileInfo.email}</td>
                            </tr>
                            <tr>
                                <td>Mobile No.</td>
                                <td>{profileInfo.mobileWithDialCode}</td>
                            </tr>
                            <tr>
                                <td>Active Plan</td>
                                <td>{profileInfo.planname}</td>
                            </tr>
                            <tr>
                                <td>Expire date</td>
                                <td>{getFormattedDate(profileInfo.expiredate)}</td>
                            </tr>
                        </tbody>
                    </table>
                </>) : (<div className='profile-login-container'>
                    <img src={kableOneLogo} />
                    <span>You are not logged in!!</span>
                    <span>Please click on login to continue.</span> 
                </div>)}
                <FocusableButton
                    text={isLoggedIn ? 'LOGOUT' : 'LOGIN'}
                    className='profile-btn-login'
                    focusClass='profile-btn-login-focused'
                    focuskey={'BTN_LOGIN_LOGOUT_PROFILE'}
                    onEnterPress={loginButtonEnterPressHandler}
                />
            </div>
        </FocusContext.Provider>
    )
}

export default ProfileHomePage