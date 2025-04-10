import React, { useEffect } from "react";
import ContentWithBanner from "./Content";
import Menu from "../Menu_Home/Menu";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";
import './index.css'

const MovieHomePage = () =>{

    useEffect(() => {
        setFocus('Menu_Abc');
        //window.addEventListener('keydown', keyDownHandler)
        return () => {
           // window.removeEventListener("keydown", keyDownHandler);
        };
    }, []);

    const MenuItems = [{
        id: 1,
        label: 'Menu 1',
        icon: 'Home'
    }, {
        id: 2,
        label: 'Menu 2',
        icon: 'Home'
    }];

return (
    <div style={{flex:1, display: 'flex', width:'100%'}}>
     <Menu focusKey='Menu_Abc' Menu={MenuItems} />
   <ContentWithBanner />
   </div>
)
}

export default MovieHomePage