import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {getData} from "../../redux/actions";
import {connect} from 'react-redux'

import'./body.css';
import 'npm-font-open-sans/open-sans.css'


class Body extends Component{
    constructor(){
        super();
        this.state = {
            tableOne: ['8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
            tableTwo: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
            newList: [],
            activeAdaptList: {},
            helpText: false
        }
}

    adaptationList = (arr) =>{
        let newList = [];

        arr.map((item)=>{
            let objEvent = {
                id: item._id,
                top: item.start*2,
                height: item.duration*2,
                left: 50,
                width: 198,
                title: item.title
            };


            return newList.push(Object.assign({}, objEvent))
        });

        for(let i=0; i<newList.length; i++){
            if(newList[i].top < 600 && newList[i].top + newList[i].height > 600){
                let childEventLastHeight = newList[i].top + newList[i].height - 600;
                newList[i].height = 600 - newList[i].top;
                let newArr = {id: newList.length, idParent: newList[i].id, top: 600, height: childEventLastHeight, left: 50, width: 198, title: `Continue: ${newList[i].title}`};
                newList.splice(i+1, 0,newArr )
            }
        }

        function compareEvents(eventsA, eventsB) {
            return eventsA.top - eventsB.top;
        }

        newList.sort(compareEvents);


        let maxHeight;
        for(let i=0; i<newList.length; i++){
            if(i){
                if(newList[i].top < maxHeight){
                    newList[i].width = 98;
                    newList[i - 1].width = 98;

                    if (newList[i].left === 50 || newList[i].left === 150) {
                        newList[i].left = newList[i - 1].left === 50 ? 150 : 50;
                    }
                    if(newList[i].top < maxHeight && newList[i].top > newList[i-1].top + newList[i-1].height){
                        newList[i].left = newList[i - 1].left
                    }
                }

                if(newList[i].top > maxHeight || newList[i].top + newList[i].height > maxHeight){
                    maxHeight = newList[i].top + newList[i].height;
                }

            }else{
                maxHeight = newList[i].top + newList[i].height;
            }
        }

        for(let i=0; i<newList.length; i++){
            if(newList[i].top >= 600){
                newList[i].top -= 600;
                newList[i].left += 300
            }
        }
        return newList
    };


    componentDidMount(){
        this.props.getData();
    }


    render() {
        let arrEvents;
        if(this.props.eventServer.length !== 0) {
            arrEvents = this.adaptationList(this.props.eventServer);
        }
        const {tableOne, tableTwo, helpText, activeAdaptList} = this.state;
        return (
            <div className='containerContent'>
                <div className='buttonNav'>
                    <Link to='/newnotation'><button className='buttonNewEvent'>Новое событие</button></Link>
                    <Link to='/newlist'><button className='buttonNewList'>Загрузить свой список</button></Link>
                    <span className='buttonFAQ'
                          onClick={()=>{
                              let result = !helpText;
                              this.setState({helpText: result})
                          }}

                    >?</span>
                    {helpText && <div className='helpText'>Для просмотра и редактирования: нажмите на событие и перейдите по ссылке в случае необходимости.</div>}
                </div>

                <table className='container1'>
                    <tbody>
                    {
                        tableOne.map((item, i)=>(
                            <tr className='trbody' key={i}>
                                <td className={i%2===0?'tdtimeline':'tdtime'}>{item}</td>
                                <td className={i%2===0?'tdtitleline':'tdtitle'}> </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

                <table className='container2'>
                    <tbody>
                    {
                        tableTwo.map((item, i)=>(
                            <tr className='trbody' key={i}>
                                <td className={i%2===0?'tdtimeline':'tdtime'}>{item}</td>
                                <td className={i%2===0?'tdtitleline':'tdtitle'}> </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

                    <div className='events'>

                       {arrEvents &&

                            arrEvents.map((item)=>{
                                   if(!activeAdaptList[item.id]){
                                       return(
                                           <div
                                           key={item.id}
                                           className={activeAdaptList[item.id]?'cardEventsActive':'cardEvents'}
                                           style={{
                                               top: item.top,
                                               height: item.height,
                                               left: item.left,
                                               width: item.width
                                           }}
                                           onClick={()=>{
                                               let id = item.id;
                                               this.setState({activeAdaptList: {[id]:!activeAdaptList[id]}})
                                           }}

                                       >
                                           {item.title}
                                       </div>
                                       )
                                   }else{
                                       return(
                                           <div
                                               key={item.id}
                                               className={activeAdaptList[item.id]?'cardEventsActive':'cardEvents'}
                                               style={{
                                                   top: item.top,
                                                   height: item.height,
                                                   left: item.left,
                                                   width: 198
                                               }}
                                               onClick={()=>{
                                                   let id = item.id;
                                                   this.setState({activeAdaptList: {[id]:!activeAdaptList[id]}})
                                               }}
                                           >
                                               {item.title}
                                               <div className='buttonControl'
                                                    style={{
                                                        height: item.height,
                                                        width: 198
                                                    }}>
                                                   <Link to={`/newnotation/${item.idParent?item.idParent:item.id}`} ><button className='buttonChange'>Изменить/Удалить</button></Link>
                                               </div>
                                           </div>
                                       )
                                   }

                            })
                        }


                    </div>
                </div>
            )
        }

}

function mapStateToProps(state){
    return{
        eventServer: state.eventServer
    }
}

export default connect(
    mapStateToProps,
    {getData}
)(Body);
