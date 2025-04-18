import React, { useEffect } from "react";
import ContentWithBanner from "./Content";
import Menu_Home from "../Menu_Home";
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
     <Menu_Home focusKey='Menu_Abc' />
   <ContentWithBanner />
   </div>
)
}

export default MovieHomePage