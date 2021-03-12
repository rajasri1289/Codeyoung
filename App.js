import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, UncontrolledTooltip  } from 'reactstrap';
import api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const api_key ="056f60773c135827a7bd"
class App extends React.Component{
  constructor(props){
    super(props)
    this.state={
      currencies: [],
      lists:[],
      histories: [],
      result: "",
      optamount: "",
      optFrom: "",
      optTo: "",
      amount: 1,
      from: "USD",
      to: "BDT",
      modal: false
    }
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  componentDidMount(){
      api.get(`/currencies?apiKey=${api_key}`)
        .then(res =>{
          const currencyArr = []
          for (const key in res.data.results) {
            currencyArr.push(key);
          }
          this.setState({ currencies: currencyArr });
        })
        .catch(err => console.log(err))

        this.getHistory();  
  }

  getHistory(){
    const history = JSON.parse(localStorage.getItem('historyList'))
    this.setState({histories: history })
  }

  handleChange = (event) => {
      if (event.target.name === "from") {
          this.setState({ from: event.target.value })
      }
      if (event.target.name === "to") {
          this.setState({ to: event.target.value })
      }
  }

  handleConvert = () => {
    const fromCurr = this.state.from
    const toCurr = this.state.to
    const amount = this.state.amount
    const fromTo = fromCurr + "_" + toCurr

    api.get(`/convert?apiKey=${api_key}&q=${fromCurr}_${toCurr}&compact=y`)
      .then(res => {
          const result = this.state.amount * (res.data[fromTo].val)
          this.setState({ 
            result: result, 
            optamount: this.state.amount,
            optFrom:  this.state.from,
            optTo: this.state.to
          })

          let historyList = this.state.lists;
          historyList.push({amount, fromCurr, toCurr,  result});

          this.setState({lists: historyList }, () => {
            localStorage.setItem('historyList', JSON.stringify(this.state.lists));
          });

          this.getHistory();
      })
      .catch(err => console.log(err))
  }
  
  render(){

    return(
      <div>
        <div className="panel">
          <div className="div-center">
            <div className="content">
              <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>Recent Convert Histories</ModalHeader>
                <ModalBody>
                  {this.state.histories !== null ? this.state.histories.map(history =>
                    <p>{history.amount} {history.fromCurr} <i class="fa fa-exchange" aria-hidden="true"></i> {history.result} {history.toCurr}</p>
                  ): <p>No History Data</p>}
                </ModalBody>
              </Modal>
              <UncontrolledTooltip placement="right" target="UncontrolledTooltipExample">
                Convert History
              </UncontrolledTooltip>
              <Button id="UncontrolledTooltipExample" close onClick={this.toggle}> <i className="fa fa-history btn-icon" aria-hidden="true"></i> </Button>
              <h3 className="text-center">Currency Converter</h3>
              <hr />
              <div className="mb-4">
                <p className="text-secondary">{this.state.optamount} {this.state.optFrom}</p>
                <h2>{this.state.result} {this.state.optTo}</h2>
              </div>
              <div>
                <div className="form-group">
                  <label className="small">Amount</label>
                  <input 
                    className="form-control"
                    name="amount" 
                    type="text" 
                    value={this.state.amount} 
                    onChange={event => this.setState({ amount: event.target.value })} 
                    autoComplete="off" 
                  />
                </div>
                <div className="form-group">
                  <div className="row mb-2">
                    <div className="col">
                      <label className="small">From</label>
                      <select
                        className="form-control"
                        name="from"
                        value={this.state.from}
                        onChange={(event) => this.handleChange(event)}
                      >
                        {this.state.currencies.map(currrency => (
                          <option key={currrency}>{currrency}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col">
                      <label className="small">To</label>
                      <select
                        className="form-control"
                        name="to"
                        value={this.state.to}
                        onChange={(event) => this.handleChange(event)}
                      >
                        {this.state.currencies.map(currrency => (
                          <option key={currrency}>{currrency}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button className="btn btn-info mb-3" onClick={this.handleConvert}>Convert</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;