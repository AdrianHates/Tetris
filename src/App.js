
import './App.css';
import React from 'react';
import audio from './audio/tetris.mp3';
import gameOver from './audio/gameOver.mp3';
import smash from './audio/smash.m4a'


const bloque = [[0,4],[0,5],[1,4],[1,5]];
const palo = [[1,3],[1,4],[1,5],[1,6]];
const triplete = [[0,4],[1,3],[1,4],[1,5]];
const caballoIz = [[0,3],[1,3],[1,4],[1,5]];
const caballoDer = [[0,5],[1,3],[1,4],[1,5]];
const escaleraIz = [[0,3],[0,4],[1,4],[1,5]];
const escaleraDer = [[0,4],[0,5],[1,3],[1,4]];
const random = [
  bloque, palo, triplete, caballoIz, caballoDer, escaleraIz, escaleraDer
]
function cualquiera(){
  let a = Math.floor(Math.random()*random.length)
  return a 
}

const controles = [
  {key: 'A', id:'izq'},
  {key: 'S', id:'aba'},
  {key: 'D', id:'der'},
  {key: 'W', id:'arr'}
]

const tablaM = 20;
const tablaN = 10;

function espacio() {
  let result = []
  for(let i=0;i<tablaM;i++) { 
    let a = [];
    for(let j=0;j<tablaN;j++) {
      a.push(0)
    } result.push(a)    
  } return result  
}

const PPR = ( { id, className, onClick, texto, style } ) => {
  return(
  <button id={id} className={className} style={style} onClick={onClick}>
  {texto}
  </button>
  )
}

class Tetris extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      Actual:espacio(),
      Espejo: null,
      Elemento: null,
      Estado: null,
      Score: 0,
      w: true,
      count:0
    }
    this.plataforma=React.createRef();
    this.plat = null
    this.keysPressed=[]
  }
  
    componentDidMount() {  
    this.plat = this.plataforma.current;
    this.carga = new Audio(audio);
    this.gameOver = new Audio(gameOver);
    this.smash = new Audio(smash);
   document.addEventListener('keypress', this.EventoKey )
      
      document.addEventListener('keyup', (event)=>{
       
        if(event.code.slice(-1)==='W'&&this.state.w===false){
          this.setState({w:true})
        }        
      });    
    }      
    componentWillUnmount() {
      document.removeEventListener('keypress', this.EventoKey )
    }
    EventoKey = (event) => {     
      if(this.state.Estado) {
        
      let { Elemento, Espejo, w } = this.state
        
        //condicionar la entrada
        if(controles.map(x=>x.key).indexOf(event.code.slice(-1))>=0&&Elemento!=null){
        //--testeo de controles--console.log(event.code);
          
        let proD=this.WASD(Elemento,-1,0).map(x=>`${x[0]},${x[1]}`);
        let proI=this.WASD(Elemento,1,0).map(x=>`${x[0]},${x[1]}`);
        let proA=this.WASD(Elemento,0,1).map(x=>`${x[0]},${x[1]}`);
        let filterEspejo=Espejo.map((x,i)=>x.map((y,j)=>{
  if(y!=0) return `${i},${j}`})).flat().filter(z=>z!=undefined);
        
        if(event.code.slice(-1)==='A'&&!proD.some(el=>filterEspejo.includes(el))&&Elemento.map(x=>x[1]).filter(y=>y===0).length===0){
          
          this.setState({
        Actual: this.changuito(Espejo, this.WASD(Elemento,-1,0)),
        Elemento: this.WASD(Elemento,-1,0)
        });
        }; 
        if(event.code.slice(-1)==='D'&&!proI.some(el=>filterEspejo.includes(el))&&Elemento.map(x=>x[1]).filter(y=>y===9).length===0){
            this.setState({
            Actual: this.changuito(Espejo,this.WASD(Elemento,1,0)),
            Elemento: this.WASD(this.state.Elemento,1,0)
            });      
        };
        if(event.code.slice(-1)==='S'&&!proA.some(el=>filterEspejo.includes(el))&&Elemento.map(x=>x[0]).filter(y=>y===19).length===0){
            let proAA=this.WASD(Elemento,0,2).map(x=>`${x[0]},${x[1]}`);
            if(proAA.some(el=>filterEspejo.includes(el))||Elemento.map(x=>x[0]).filter(y=>y===18).length>0) {
              this.smash.play();
              this.smash.currentTime=0
              this.setState({
                Actual: this.changuito(Espejo,this.WASD(Elemento,0,1)),
                Elemento: this.WASD(Elemento,0,1)
                });
            }
            this.setState({
            Actual: this.changuito(Espejo,this.WASD(Elemento,0,1)),
            Elemento: this.WASD(Elemento,0,1)
            });
        };                        if(event.code.slice(-1)==='W'&&w===true&&this.rotar(Elemento).map(x=>x[1]).filter(y=>y<0||y>9).length===0&&!this.rotar(Elemento).map(x=>`${x[0]},${x[1]}`).some(el=>filterEspejo.includes(el))){
            this.setState({
            w: false,
            Actual: this.changuito(Espejo,this.rotar(Elemento)),
            Elemento: this.rotar(Elemento),
            count: this.state.w?this.state.count+1:this.state.count
            });
        };        
       }}}
    WASD=(elemento, mov, abajo) => {    
   let a = elemento.map(x=>[x[0]+abajo,x[1]+mov])
   return a
  }     
  
    ejecutarIntervalo=()=>{
      let { Espejo, Elemento, Actual, Score } = this.state;
      let proA=this.WASD(Elemento,0,1).map(x=>`${x[0]},${x[1]}`);
      let proAA=this.WASD(Elemento,0,2).map(x=>`${x[0]},${x[1]}`);
      let filterEspejo=Espejo.map((x,i)=>x.map((y,j)=>{
  if(y!=0) return `${i},${j}`})).flat().filter(z=>z!=undefined);
      //Si el siguiente mov choca con piezas existentes y que no pase el indice de las columnas.
    if(this.WASD(Elemento,0,1).map(x=>x[0]).filter(y=>y>19).length>0||proA.some(el=>filterEspejo.includes(el))) {        
        
        //Si las piezas, estan sobre piezas existentes
        if(Elemento.map(x=>`${x[0]},${x[1]}`).some(el=>filterEspejo.includes(el))) {
         document.getElementById('alerta').style.display='block';
         this.plat.style.filter='grayscale(100%)';
         clearInterval(this.pachim);                       
         this.carga.pause();
         this.gameOver.play();
         this.carga.currentTime=0;
        }
        //Si existen filas llenas, borrarlas y puntuar el score
        if(Actual.filter(el=>el.every(x=>x!==0)).length>0) {
          let CopyActual = Actual;
          let rowDelete = [];
          Actual.forEach((el,index)=>{
            if(el.every(x=>x!==0)){
              rowDelete.push(index)
            }})
            
            for(let i=0;i<rowDelete.length;i++) {
              CopyActual.splice(rowDelete[i],1);
              CopyActual.unshift(Array(10).fill(0))
            }            
            
            let rowL = rowDelete.length
            
            this.setState({
              Actual: CopyActual,
              Score: Score += rowL===4?800:(rowL===3?400:(rowL===2?200:100))
            })               
        }
        this.a = cualquiera();
        this.movimientos(random[this.a])
        this.setState({count: 0}) 
      }
      else {
      if(proAA.some(el=>filterEspejo.includes(el))||Elemento.map(x=>x[0]).filter(y=>y===18).length>0) {
        this.smash.play();
        this.smash.currentTime=0
        this.setState({
          Actual: this.changuito(Espejo,this.WASD(Elemento,0,1)),
          Elemento: this.WASD(Elemento,0,1)
          });
      } else {
       this.setState({
            Actual: this.changuito(Espejo,this.WASD(Elemento,0,1)),
            Elemento: this.WASD(Elemento,0,1)
            });
      }}        
    }
    
    comenzar = () => {
      this.carga.play(); 
      this.carga.loop=true;     
      this.setState({Estado: true, Actual:espacio()})
      this.plat.style.filter='grayscale(0%)';
      document.getElementById('play').style.display='none';
      this.plat.style.display='block'
      document.getElementById('pausa').style.display='block';
      document.getElementById('datos').style.display='block';
      this.a=cualquiera()
      this.movimientos(random[this.a])
      this.pachim = setInterval(this.ejecutarIntervalo,1000);

    }
  
    pausa = () => {
      this.carga.pause()
      if(this.state.Estado){
      document.getElementById('renaudar').style.display='block';
      this.setState({Estado: false})
      clearInterval(this.pachim)}      
    }
  
    renaudar = () => {
      this.carga.play()
      if(!this.state.Estado){
      document.getElementById('renaudar').style.display='none';
      this.setState({Estado: true})
      this.pachim = setInterval(this.ejecutarIntervalo,1000)}
    }
  
    movimientos = (fig) => {
      let { Actual,Espejo } = this.state
      let a = this.changuito(Actual,fig);
      if(Espejo) {      
      let filterEspejo=Espejo.map((x,i)=>x.map((y,j)=>{
        if(y!=0) return `${i},${j}`})).flat().filter(z=>z!=undefined);
        if(this.WASD(random[this.a],0,1).map(x=>`${x[0]},${x[1]}`).some(el=>filterEspejo.includes(el))||this.WASD(random[this.a],0,2).map(x=>`${x[0]},${x[1]}`).some(el=>filterEspejo.includes(el))){
          
          this.smash.play();
          this.smash.currentTime=0
          
        };};
        
       this.setState({ 
        Elemento: fig,
        Espejo:Actual,
        Actual:a})
    } 
     ok = () => {
      document.getElementById('play').style.display='block';
      this.plat.style.display='none'
      document.getElementById('pausa').style.display='none';
      document.getElementById('datos').style.display='none';
      document.getElementById('alerta').style.display='none';
       this.setState({
          Actual:espacio(),
          Espejo: null,
          Elemento: null,
          Estado: null,
          Score: 0,
          w: true,
          count:0
       })
     }
  
    changuito=(matrix, figura)=>{
    let a = matrix.map(x=>[...x])
      for(let i=0;i<figura.length;i++) {
        if(this.a===0){
        a[figura[i][0]][figura[i][1]]=1;
        };        
        if(this.a===1){
        a[figura[i][0]][figura[i][1]]=2;
        };
        if(this.a===2){ 
        a[figura[i][0]][figura[i][1]]=3;
        };       
        if(this.a===3){
        a[figura[i][0]][figura[i][1]]=4;
        };
        if(this.a===4){
        a[figura[i][0]][figura[i][1]]=5;
        };
        if(this.a===5){
        a[figura[i][0]][figura[i][1]]=6;
        };
        if(this.a===6){
        a[figura[i][0]][figura[i][1]]=7;
        };
      } return a
    }
  
    rotar=(el)=>{
      let { count } = this.state
      if(this.a===1) {
        switch(count%4) {
          case 0: 
            return el.map((x,i)=>[el[2][0]-1+i,el[2][1]]);            
          case 1:
            return el.map((x,i)=>[el[2][0],el[2][1]-2+i]);
          case 2:
            return el.map((x,i)=>[el[1][0]-2+i,el[1][1]]);            
          case 3:
            return el.map((x,i)=>[el[1][0],el[1][1]-1+i]);            
        }
      };
      if(this.a===0) {
        return el
      }
      if(this.a===2) {
        switch(count%4) {
          case 0:
            return el.slice(0,1).concat(el.slice(2,4)).concat([[el[2][0]+1,el[2][1]]]);
          case 1:
            return [[el[1][0],el[1][1]-1]].concat(el.slice(1));
          case 2:
            return [[el[1][0]-1,el[1][1]]].concat(el.slice(0,2).concat(el.slice(3,4)));
          case 3:
            return el.slice(0,3).concat([[el[2][0],el[2][1]+1]]);
        }
      }
      if(this.a===3) {        
        switch(count%4) {
          case 0:            
            return [el[2]].map(x=>[x[0]-1,x[1]]).concat([el[2]].map(x=>[x[0]-1,x[1]+1])).concat([el[2]]).concat([el[2]].map(x=>[x[0]+1,x[1]]));
          case 1:
            return [el[2]].map(x=>[x[0],x[1]-1]).concat([el[2]]).concat([el[2]].map(x=>[x[0],x[1]+1])).concat([el[2]].map(x=>[x[0]+1,x[1]+1]));
          case 2:
            return [el[1]].map(x=>[x[0]-1,x[1]]).concat([el[1]]).concat([el[1]].map(x=>[x[0]+1,x[1]])).concat([el[1]].map(x=>[x[0]+1,x[1]-1]));
          case 3:
            return [el[1]].map(x=>[x[0]-1,x[1]-1]).concat([el[1]].map(x=>[x[0],x[1]-1])).concat([el[1]]).concat([el[1]].map(x=>[x[0],x[1]+1]));
        
      } 
    }
      if(this.a===4) {        
        switch(count%4) {
          case 0:            
            return [el[2]].map(x=>[x[0]-1,x[1]-1]).concat([el[2]].map(x=>[x[0]-1,x[1]])).concat([el[2]]).concat([el[2]].map(x=>[x[0]+1,x[1]]));
          case 1:
            return [el[2]].map(x=>[x[0],x[1]-1]).concat([el[2]]).concat([el[2]].map(x=>[x[0],x[1]+1])).concat([el[2]].map(x=>[x[0]+1,x[1]-1]));
          case 2:
            return [el[1]].map(x=>[x[0]-1,x[1]]).concat([el[1]]).concat([el[1]].map(x=>[x[0]+1,x[1]])).concat([el[1]].map(x=>[x[0]+1,x[1]+1]));
          case 3:
            return [el[1]].map(x=>[x[0]-1,x[1]+1]).concat([el[1]].map(x=>[x[0],x[1]-1])).concat([el[1]]).concat([el[1]].map(x=>[x[0],x[1]+1]));
        
      } 
    }
      if(this.a===5) {        
        switch(count%4) {
          case 0:            
            return [el[2]].map(x=>[x[0]-1,x[1]+1]).concat(el.slice(2)).concat([el[2]].map(x=>[x[0]+1,x[1]]));
          case 1:
            return [el[1]].map(x=>[x[0],x[1]-1]).concat([el[1]]).concat([el[1]].map(x=>[x[0]+1,x[1]])).concat([el[1]].map(x=>[x[0]+1,x[1]+1]));
          case 2:
            return [el[1]].map(x=>[x[0]-1,x[1]]).concat(el.slice(0,2)).concat([el[1]].map(x=>[x[0]+1,x[1]-1]));
          case 3:
            return [el[2]].map(x=>[x[0]-1,x[1]-1]).concat([el[2]].map(x=>[x[0]-1,x[1]])).concat([el[2]]).concat([el[2]].map(x=>[x[0],x[1]+1]));
        
      } 
    }
      if(this.a===6) {        
        switch(count%4) {
          case 0:            
            return [el[3]].map(x=>[x[0]-1,x[1]]).concat([el[3]]).concat([el[3]].map(x=>[x[0],x[1]+1])).concat([el[3]].map(x=>[x[0]+1,x[1]+1]));
          case 1:
            return [el[1]].concat([el[1]].map(x=>[x[0],x[1]+1])).concat([el[1]].map(x=>[x[0]+1,x[1]-1])).concat([el[1]].map(x=>[x[0]+1,x[1]]));
          case 2:
            return [el[0]].map(x=>[x[0]-1,x[1]-1]).concat([el[0]].map(x=>[x[0],x[1]-1])).concat([el[0]]).concat([el[0]].map(x=>[x[0]+1,x[1]]));
          case 3:
            return [el[2]].map(x=>[x[0]-1,x[1]]).concat([el[2]].map(x=>[x[0]-1,x[1]+1])).concat([el[2]].map(x=>[x[0],x[1]-1])).concat([el[2]]);
        
      } 
    }
}

  render() {
    const { Actual } = this.state    
    return(
      <div id='todoDeTodo'>
      <div id='todo'>
        <div id='datos' style={{display:'none'}}>
          <p>SCORE</p>
          <div id='score'>
          {this.state.Score}
          </div>
        </div>
        <div id='plataforma' style={{display:'none'}} ref={this.plataforma}>
          <table id='tableta'> 
            {Actual.map(x=><tr>{x.map(y=><td className={y===1?'alive1':(y===2?'alive2':(y===3?'alive3':(y===4?'alive4':(y===5?'alive5':(y===6?'alive6':(y===7?'alive7':'dead'))))))}></td>)}</tr>)}
          </table>         
        </div>
        <PPR id='play' className='btn btn-success' onClick={this.comenzar} texto='Play'/>        
        <PPR id='pausa' className='btn btn-danger' style={{display:'none'}} onClick={this.pausa} texto='Pausa'/>
        <PPR id='renaudar' className='btn btn-primary' style={{display:'none'}} onClick={this.renaudar} texto='Renaudar'/>
        <div id='alerta' style={{display: 'none'}}>
          <p>KUASI</p>
          <button id='kuasi' onClick={this.ok}>
          OK
          </button>
          <p>OVER</p>
        </div>
        
      </div>
      <footer id='footer'>
      Designed and Coded By<a target ='_blank' rel="noreferrer" href='https://adrianhates.github.io/Portfolio/'><br />   Herless</a>
      </footer>
    </div>
    )
  }
}

export default Tetris;
