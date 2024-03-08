import React, {useState, useEffect, useRef} from 'react'
import unorm from 'unorm';
import { FaWifi, FaRegHeart, FaHeart } from "react-icons/fa";
import { IoBatteryHalf } from "react-icons/io5";
import { FaSignal } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";

import fetchData from "../api/api"
import logo from "../assets/momo_circle_pinkbg.svg"
import "./style.scss";

const Home = () => {
    const [contacts,setContacts] = useState([])
    const [data,setData] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = useRef(null);

    useEffect( () => {
        fetchData()
            .then((res)=> {
                setIsLoading(true);
                convertData(res.contacts)
                setData(res.contacts)
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
    }, []);

    const toggleIcons =(idx, index) => {
        const newContacts = [...contacts];
        newContacts[idx].contacts[index].isLike = !newContacts[idx].contacts[index].isLike
        setContacts(newContacts)
    }
    const convertData = (contacts) => {
        if(contacts.length >= 0){
            // Tạo một đối tượng để nhóm contacts theo chữ cái đầu tiên trong 'last_name'
            const groupedContacts = contacts.reduce((result, contact) => {
                const firstLetter = contact.last_name?.charAt(0).toUpperCase();
                if (!result[firstLetter]) {
                    result[firstLetter] = [];
                }
                result[firstLetter].push({...contact, isLike: true});
                return result;
            }, {});
    
            // Chuyển đối tượng nhóm thành một mảng các nhóm
            const groupedContactsArray = Object.entries(groupedContacts).map(([letter, contacts]) => ({
                letter,
                contacts,
            }));
    
            // Sắp xếp các nhóm theo chữ cái đầu tiên
            groupedContactsArray.sort((a, b) => a.letter.localeCompare(b.letter));
            groupedContactsArray.forEach((e)=>e.contacts.sort((a, b) => a.first_name.localeCompare(b.first_name)));
            setContacts(groupedContactsArray)
        }
    }
    
    const searchData = (contacts, searchTerm) => {
        const removeDiacritics = (str) => {
            return unorm.nfkd(str).replace(/[\u0300-\u036f]/g, '');
        }
        
        // Chuyển đổi searchTerm thành chữ cái viết hoa và xóa dấu
        const upperCaseSearchTerm = removeDiacritics(searchTerm.toUpperCase().replace(/Đ/g, "D"));
        // Lọc kết quả dựa trên điều kiện tìm kiếm
        const filteredResults = contacts
            .filter(contact => 
                    (contact.phoneNumber).toUpperCase().includes(upperCaseSearchTerm) ||
                    removeDiacritics(`${contact.last_name} ${contact.first_name}`).replace(/Đ/g, "D").toUpperCase().includes(upperCaseSearchTerm)
                )
            .sort((a, b) => a.first_name.localeCompare(b.first_name));

        convertData(filteredResults)
    };

    const inputData = (event) =>{
        searchData(data, inputRef.current.value.trim())
    }

    const clearInput = () => {
        inputRef.current.value = '';
        searchData(data, inputRef.current.value)
    }
    let date = new Date();

  return (
    <div>
        <div className="nav">
            <div className="header">
                <div className="time">
                    {`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`}
                </div>
                <div className="header-icons">
                    <FaSignal className="header-icon"/>
                    <FaWifi className="header-icon"/>
                    <IoBatteryHalf className="header-icon"/>
                </div>
            </div>
            <div className="search">
                <div className="search-box">
                    <IoIosSearch className="icon"/>
                    <input 
                        type="text" 
                        onChange={(e)=>inputData(e)} 
                        placeholder='Nhập tên, số điện thoại hoặc số tài khoản'
                        className='input-search'
                        ref={inputRef}
                    />
                </div>
                <div className="cancel" onClick={()=>clearInput()}>
                    Hủy
                </div>
            </div>
        </div>

        <div className="types">
            <div className="type highlight">
                Bạn bè
            </div>
            <div className="type">
                Tài khoản ngân hàng
            </div>
        </div>
        {/* Danh ba */}
        {isLoading ? (
            <p style={{ textAlign:'center', fontSize:'32px'}}>Loading...</p>
        ) : (
            <div className="container" >
                {contacts?.map((group, idx) => {
                    return (
                        <div key={idx} className="content">
                            <div className="word">
                                {group.letter}
                            </div>
                            {group.contacts?.map((info, index) => {
                                return (
                                <div className="wrap" key={index}>
                                    {index > 0 ? (
                                        <div className="seperate"></div>
                                    ) : (
                                        <></>
                                    )}
                                    
                                    <div className="person">
                                        <div className="avatar">
                                            <span style={{fontSize:'16px', top:'-4px', position:'relative'}}>
                                                {`${info.last_name.charAt(0)}${info.first_name.charAt(0)}`}
                                            </span>
                                            <img src={logo} className="logo" alt="logo" />
                                        </div>
                                        <div className="info">
                                            <div>
                                                <div className="name">
                                                    {`${info.last_name} ${info.first_name}`}
                                                </div>
                                                <div className="phone">
                                                    {info.phoneNumber}
                                                </div>
                                            </div>
                                            
                                            <div className="icon" onClick={()=>toggleIcons(idx, index)}>
                                                {info.isLike ?(
                                                    <FaRegHeart className='icon1'/>
                                                ):(
                                                    <FaHeart className='icon2'/>
                                                )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )
                                })
                            }
                        </div>)
                    })
                }
            </div>
        )
        }
    </div>
  )
}

export default Home