import React, { Component } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
  Icon,
  Divider
} from "semantic-ui-react";
import { Checkbox, Input, Radio, Select, TextArea } from "semantic-ui-react";
import {CopyToClipboard} from 'react-copy-to-clipboard';

class NewBin extends Component {
  state = {
    inputs: [
      <Form.Group inline>

        <Form.Field
          control={Input}
          label="IP"
          placeholder="1.0.0.721"
          id="ip_1"
        />
        <Form.Field
          control={Input}
          label="Repeat"
          placeholder="integer or '4ever'"
          id="repeat_1"
        />
      </Form.Group>
    ],
    value: "",
    errorMsgText: "",
    succMsgText: "",
    hideErrorMsg: true,
    hideSuccMsg: true
  };

  handleChange = (e, { value }) => this.setState({ value: value });

  handleErrorMsg = (text) => {
    this.setState({
      errorMsgText: text,
      hideErrorMsg: false,
      hideSuccMsg: true
    })
  }

  handleSuccMsg = (text) => {
    this.setState({
      succMsgText: text,
      hideSuccMsg: false,
      hideErrorMsg: true
    })
  }

  handleAddInput = () => {
    var inputs_len = this.state.inputs.length + 1;
    if (inputs_len >= 33) {
      this.handleErrorMsg("Max 32 IPs!");
      return null;
    }
    var new_input = (
      <Form.Group inline>

        <Form.Field
          control={Input}
          label="IP"
          placeholder="1.0.0.721"
          id={"ip_" + inputs_len}
        />
        <Form.Field
          control={Input}
          label="Repeat"
          placeholder="integer or '4ever'"
          id={"repeat_" + inputs_len}
        />
      </Form.Group>
    );
    this.setState({
      inputs: this.state.inputs.concat(new_input)
    });
    console.log(this.state.inputs.concat(new_input));
  };

  handleResetInput = () => {
    this.setState({
      inputs: [
        <Form.Group inline>

          <Form.Field
            control={Input}
            label="IP"
            placeholder="1.0.0.721"
            id="ip_1"
          />
          <Form.Field
            control={Input}
            label="Repeat"
            placeholder="integer or '4ever'"
            id="repeat_1"
          />
        </Form.Group>
      ]
    });
  };

    handleSubmit = () => {
      if(document.getElementById('name').value===""){
        this.handleErrorMsg('All fields have to be filled out');
        return false;
      }
      var new_bin = {
        "name": document.getElementById('name').value,
        "ip_props": {}
      };
      var i;
      for (i = 1; i < this.state.inputs.length+1; i++) {
        if (isNaN(document.getElementById('repeat_'+i).value) && (document.getElementById('repeat_'+i).value !== "4ever")){
          console.log(isNaN(document.getElementById('repeat_'+i).value))
          console.log(document.getElementById('repeat_'+i).value)
          this.handleErrorMsg('Repeat field should contain "4ever" or a valid number');
          return false;
        }
        var ip_props = {
          "ip": document.getElementById('ip_'+i).value,
          "repeat": !isNaN(document.getElementById('repeat_'+i).value) ? Number(document.getElementById('repeat_'+i).value) : "4ever"
        };
        if(ip_props["ip"] === "" | ip_props["repeat"] === ""){
          this.handleErrorMsg('All fields have to be filled out');
          return false;
        }
        new_bin["ip_props"][i.toString()]=ip_props
      }

      var bearer = "Bearer " + localStorage.getItem("access_token");
      var obj = {
        method: "POST",
        headers: new Headers({
          Accept: "aplication/json",
          Authorization: bearer,
          "Access-Control-Request-Headers": "Authorization, Accept",
          "content-type": "application/json"
        }),
        body: JSON.stringify(new_bin)
      };
      fetch("http://localhost:5000/api/fookup/new", obj)
        .then(res => res.json())
        .then(data => {
          if (data.subdomain != null) {
            this.setState({subdomain: data.subdomain})
            this.handleSuccMsg("Here you go! "+data.subdomain);
          }
          else if(data.message != null){
            this.handleErrorMsg(data.message);
          }
          else {
            this.handleErrorMsg("Some error occured, check console for more info");
            console.log(data);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }

  render() {
    return (
      <div>
        <Grid
          textAlign="center"
          style={{ height: "10vh" }}
          verticalAlign="middle"
        >
          <Grid.Row>
            <Grid.Column style={{ maxWidth: 450 }}>
              <Header size="huge" textAlign="center">
                <Header.Content>Create OP dns bin!</Header.Content>
                <Header.Subheader>
                  For now, just A records are supported so no IPV6 or CNAME
                  unfortunatelly and max 32 IPs can be used (I hope nodody will
                  ever need to use that many)
                </Header.Subheader>
              </Header>
            </Grid.Column>
          </Grid.Row>

          <Message
          negative
          hidden={this.state.hideErrorMsg}
          >
            <Message.Header>{this.state.errorMsgText}</Message.Header>
          </Message>

          <Grid.Row>
            <Grid.Column width={3}></Grid.Column>

            <Grid.Column style={{ maxWidth: 750 }} width={14}>
              <Segment color="grey">
                <Form
                size="large"
                >
                  <Grid centered columns={2}>
                    <Grid.Column>
                      <Form.Group>
                        <Form.Field
                          control={Input}
                          label="Name of DNSbin"
                          placeholder="example"
                          width={15}
                          id='name'
                        />

                      </Form.Group>
                    </Grid.Column>
                  </Grid>

                  <Button.Group>
                    <Button

                      icon="plus"
                      color='yellow'
                      content='Add field'
                      onClick={() => this.handleAddInput()}
                    />
                    <Button

                      icon="delete"
                      color='red'
                      content='Delete fields'
                      onClick={() => this.handleResetInput()}
                    />
                  </Button.Group>
                  <Divider/>
                  {this.state.inputs}

                  <Form.Field
                  control={Button}
                  fluid
                  color='yellow'
                  size="large"
                  onClick={() => this.handleSubmit()}
                  >
                    Submit
                  </Form.Field>
                  <Message
                  positive
                  hidden={this.state.hideSuccMsg}
                  >
                    <Message.Header>
                    {this.state.succMsgText}
                    <br/>
                    <CopyToClipboard
                    text={this.state.subdomain}
                    onCopy={() => this.setState({copied: true})}
                    >
                      <Button
                      icon='copy outline'
                      labelPosition='left'
                      content='Copy subdomain'

                      color='olive'
                      >
                      </Button>
                  </CopyToClipboard>
                    </Message.Header>
                  </Message>
                </Form>
              </Segment>
            </Grid.Column>
            <Grid.Column width={3}></Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default NewBin;
