import React, { useEffect } from "react";
import ContentWithBanner from "./Content";
import Menu from "../Menu_Home/Menu";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";
import './index.css'

const MovieHomePage = () =>{

    useEffect(() => {
        setFocus('Menu_Abc');
        return () => {
        };
    }, []);

return (
    <div style={{flex:1, display: 'flex', width:'100%'}}>
     <Menu focusKey='Menu_Abc' />
   <ContentWithBanner />
   </div>
)
}

export default MovieHomePage