import React, { useEffect, useState } from "react";
import "./SideBar.css"; // Ensure styling for sidebar animations
import { FocusContext, setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import { MdRadioButtonUnchecked, MdRadioButtonChecked, MdCheck } from "react-icons/md";

const Context = ({
    title,
    items,
    selectedItem,
    onItemSelect,
    focusKey
}) => {
    const {
        ref,
        focusKey: currentFocusKey
    } = useFocusable({
        focusable: true,
        focusKey,
        trackChildren: false,
        saveLastFocusedChild: false
    });
    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className={'context_data'} ref={ref}>
                <p>{title}</p>
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div key={item.label} >
                            <FocusableButton
                                text={item.label}
                                onEnterPress={() => onItemSelect(item)}
                                isSelected={item.id === selectedItem}
                                className={`focusableButton`}
                                focusClass={`focusableButton-focused`}
                                icon={item.id === selectedItem ? <MdCheck /> : <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"></svg>}
                            />
                        </div>
                    ))
                ) : (
                    <FocusableButton
                        text={'Default'}
                        onEnterPress={() => { }}
                        isSelected={true}
                        className={`focusableButton`}
                        focusClass={`focusableButton-focused`}
                        icon={<MdCheck />}
                    />
                )}
            </div>
        </FocusContext.Provider>
    );

}

const SideFooter = ({ focusKey, onClose }) => {
    const {
        ref,
        focusKey: currentFocusKey
    } = useFocusable({
        focusable: true,
        focusKey
    });

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className="sideBar_footer" ref={ref}>
                <FocusableButton
                    text={'Close'}
                    onEnterPress={onClose}
                    className={'sidebar-close-button'}
                    focusClass={'sidebar-close-button-focus'}
                />
            </div>
        </FocusContext.Provider>);
}


const SideBar_Tab = ({
    isOpen = true,
    captions = [{ id: '1', label: 'test' }, { id: '2', label: 'test2' }],
    selectedCaption = -1,
    onCaptionSelect,
    qualityLevels = [{ id: '1', label: 'test' }, { id: '2', label: 'test2' }],
    onQualitySelect = () => { },
    selectedQuality = -1,
    audioTracks = [{ id: '1', label: 'test' }, { id: '2', label: 'test2' }],
    selectedAudio = -1,
    onAudioSelect = () => { },
    activeTabs = ['audio','video','captions']
}) => {

    useEffect(() => {
        if(!activeTabs || !isOpen)
             return;
            
        //setting Focus according to activeTabs
        if(activeTabs[0] == 'audio')
        {
            setFocus('audio_con');
        }else if(activeTabs[0] == 'video'){
            setFocus('video_con');
        }else if(activeTabs[0] == 'captions'){
            setFocus('captions_con');
        }
    }, [isOpen])

    return (
        <div id='sideBar' className={`sidebar ${isOpen ? "open" : ""}`}>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                
                {activeTabs && activeTabs.includes("video") && (
                <Context
                    title={'Video'}
                    items={qualityLevels}
                    onItemSelect={onQualitySelect}
                    selectedItem={selectedQuality}
                    focusKey={'video_con'}
                    key={'video_con'} 
                    />)}
                 {activeTabs && activeTabs.includes("audio") && (
                <Context
                    title={'Audio'}
                    items={audioTracks}
                    onItemSelect={onAudioSelect}
                    selectedItem={selectedAudio}
                    focusKey={'audio_con'}
                    key={'audio_con'}
                /> )}
                 {activeTabs && (activeTabs.includes("captions") || activeTabs.includes('subtitles')) && (
                <Context
                    title={'Subtitles'}
                    items={captions}
                    onItemSelect={onCaptionSelect}
                    selectedItem={selectedCaption}
                    focusKey={'caption_con'}
                    key={'captions_con'}
                />)}

            </div>
        </div>
    );
};

export default SideBar_Tab