import React, { Component } from 'react';
import IssueView from './IssueView';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

class IssueList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      pageNum: 1,
      issues: [],
      airlines: "",
      acType: "",
      origin:"",
      dest:"",
      status: 0,
    };
    this.leftClick = this.leftClick.bind(this)
    this.rightClick = this.rightClick.bind(this)
    this.handleAirlines = this.handleAirlines.bind(this)
    this.handleAircraft = this.handleAircraft.bind(this)
    this.handleOrigin = this.handleOrigin.bind(this)
    this.handleDest = this.handleDest.bind(this)
  }

  leftClick() {

    // Changing state 
    if (this.state.pageNum > 1) {
      this.setState({ pageNum: this.state.pageNum - 1 })
    }
  }
  rightClick() {

    // Changing state
    if (this.state.pageNum < this.state.issues.length / 10) {
      this.setState({ pageNum: this.state.pageNum + 1 })
    }
  }
  handleAirlines(e) {
    this.setState({ airlines: e.target.value });
  }

  handleOrigin(e) {
    this.setState({origin: e.target.value});
  }

  handleDest(e) {
    this.setState({dest: e.target.value});
  }

  handleAircraft(e) {
    this.setState({ acType: e.target.value });
  }

  handleSubmit(e) {
    this.setState({ isLoaded: false, status: 0, issues: [] });
    e.preventDefault();
    var config = {
      headers: {
        'Authorization': 'Bearer g2g7vkdmwzx7dt6stvvrt35s'
      }
    };
    if (this.state.airlines === '') {
      alert('Please select airlines');
      return;
    }

    let url = 'https://api.lufthansa.com/v1/flight-schedules/flightschedules/passenger?airlines=' + this.state.airlines + '&startDate=01JUN21&endDate=09JUN21&daysOfOperation=1234567&timeMode=UTC';
    if (this.state.acType.length > 0) {
      url += '&aircraftTypes=' + this.state.acType;
    }

    if (this.state.origin.length > 0 && this.state.origin.length !== 3) {
      alert('ICAO code should be 3 letters for origin')
      return;
    }
    if (this.state.origin.length > 0) {
      url += '&origin=' + this.state.origin;
    }
    if (this.state.dest.length > 0 && this.state.dest.length !== 3) {
      alert('ICAO code should be 3 letters for destination')
      return;
    }
    if (this.state.dest.length > 0) {
      url += '&destination=' + this.state.dest;
    }

    axios.get(url, config).then((res) => {
      if (res.status === 200 || res.status === 206) {
        console.log(res.data);
        this.setState({ isLoaded: true, issues: res.data, status: res.status })
      }
    }).catch((err) => {
      console.log(err)
      this.setState({ status: err.response.status });
    })
  }

  render() {
    const { classes } = this.props;
    let issueViews;
    if (this.state.isLoaded) {
      issueViews = this.state.issues.slice((this.state.pageNum - 1) * 10, this.state.pageNum * 10).map(
        issue => <IssueView key={issue.id} issue={issue} setDetails={this.props.setDetails} />
      )
    }
    return (
      <div className="container">
        <h1>Jumbo Jet Finder| List of Flights</h1>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <Grid container justify="center" spacing={3}>
            <Grid item>
              <FormControl required className={classes.formControl}>
                <InputLabel id="demo-simple-select-helper-label">Airlines</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={this.state.airlines}
                  onChange={this.handleAirlines}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={'LH'}>Lufthansa</MenuItem>
                  <MenuItem value={'LX'}>Swiss Air</MenuItem>
                </Select>
                <FormHelperText>Select an airline</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-helper-label">Aircraft type</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={this.state.acType}
                  onChange={this.handleAircraft}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={'744'}>Boeing 747-400</MenuItem>
                  <MenuItem value={'74H'}>Boeing 747-800</MenuItem>
                  <MenuItem value={'343'}>Airbus A340-300</MenuItem>
                </Select>
                <FormHelperText>Select an aircraft type</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField id="standard-basic" label="Origin ICAO" onChange={(e) => this.handleOrigin(e)}/>
            </Grid>
            <Grid item>
              <TextField id="standard-basic" label="Dest. ICAO" onChange={(e) => this.handleDest(e)}/>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" type="submit">
                Find flights
              </Button>
            </Grid>
          </Grid>
        </form>
        {this.state.isLoaded ?
          <div>
            <h3>Page: {this.state.pageNum}</h3>
            {(this.state.pageNum > 1) ? <button onClick={this.leftClick}>
              Left
          </button> : null}
            {(this.state.pageNum < this.state.issues.length / 10) ? <button onClick={this.rightClick}>
              Right
          </button> : null}
          </div>
          : null
        }


        {this.state.isLoaded ? issueViews : null}
        {this.state.status === 400 ? <h1>Invalid parameters found, try again</h1> : null}
        {this.state.status === 404 ? <h1>Couldn't find a flight with select parameters, try again</h1> : null}
        {this.state.status === 500 ? <h1>Looks like the service is being overloaded, try again in a minute</h1> : null}
      </div>
    );

  }
}

export default withStyles(styles, { withTheme: true })(IssueList);
