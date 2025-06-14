import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import React, { useEffect, useState } from 'react'
import { SearchKeyboard } from './Keyboard'
import FullPageAssetContainer from '../Common/FullPageAssetContainer';
import './index.css'
import { fetchSearchContentResult, fetchTrendingSearch } from '../../Service/MediaService';

function SearchScreen({focusKey}) {
    const [searchData, setSearchData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
        focusKey,
        focusable: true
    });

    const loadTrendingSearchResult = async () => {
        setSearchData([]);
        try {
            const response = await fetchTrendingSearch();
            if (response && response.isSuccess) {
                setSearchData(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.log('error', error);
        }finally{
            setIsLoading(false);
        }
    }

    const loadSearchData = async () =>{
        setSearchData([]);
        setIsLoading(true);
        if(inputQuery.length == 0) return;
           try {
            const response = await fetchSearchContentResult(inputQuery.toString());
            if (response && response.isSuccess) {
                setSearchData(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.log('error', error);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        loadTrendingSearchResult();
    }, []);

    useEffect(() => {
    if (inputQuery.length > 0) {
        loadSearchData();
    } else {
        setIsLoading(true);
        loadTrendingSearchResult();
    }
}, [inputQuery]);

    const onKeyPress = (key) => {
    console.log('key', key);
    switch (key) {
        case 'delete':
            setInputQuery((prev) => prev.slice(0, -1));
            break;

        case 'space':
            setInputQuery((prev) => prev.toString() + ' ');
            break;

        case 'clear':
            setInputQuery('');
            break;

        default:
            setInputQuery((prev) => prev.toString() + key.toString());
    }
};

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className='search-page' ref={ref}>
                <div className='keyboard-container'>
                    <div className='search-input' 
                    style={{color : `${inputQuery.length > 0 ? 'white' : '#797474' }`}}>
                        {inputQuery.length > 0 ? inputQuery :  'SEARCH'}
                    </div>
                    <SearchKeyboard onKeyPress={onKeyPress} focusKey={'KEYBOARD_FOCUS_KEY'} />
                </div>
                 <FullPageAssetContainer 
                    focusKey={'SEARCH_PAGE_ASSETS'} 
                    assets={searchData} itemsPerRow={3} 
                    title={inputQuery.length > 0 ? 'Search Results' : 'Trending Searches'}
                    isLoading={isLoading} />
            </div>
        </FocusContext.Provider>
    )
}

export default SearchScreen