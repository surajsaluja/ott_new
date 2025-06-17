import React from 'react'
import { useUserContext } from '../../Context/userContext'
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import './index.css'
import FocusableButton from '../Common/FocusableButton';

function ProfileHomePage({ focusKey }) {
    const { isLoggedIn, uid, profileInfo } = useUserContext();
    const { ref, focuskey: currentFocusKey, focusSelf } = useFocusable({ focusKey });
    const user = {
        name: 'suraj',
        email: 'surajdgt15@gmail.com',
        mobile: '+91-9053745551',
        plan: 'Premium Yearly',
        expiry: '2026-06-02',
    };
    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className='profile-container' ref={ref}>
                {isLoggedIn ? (<>
                    <h2 className="profile-heading">PROFILE</h2>
                    <table className="profile-table">
                        <tbody>
                            <tr>
                                <td>User Name</td>
                                <td>{user.name}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <td>Mobile No.</td>
                                <td>{user.mobile}</td>
                            </tr>
                            <tr>
                                <td>Active Plan</td>
                                <td>{user.plan}</td>
                            </tr>
                            <tr>
                                <td>Expire date</td>
                                <td>{user.expiry}</td>
                            </tr>
                        </tbody>
                    </table>
                </>) : (<div className='login-container'>
                </div>)}
                <FocusableButton 
                text={isLoggedIn ? 'LOGOUT' : 'LOGIN'} 
                className='btn-login'
                />
            </div>
        </FocusContext.Provider>
    )
}

export default ProfileHomePage