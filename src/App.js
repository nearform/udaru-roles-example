import './App.css';
import React, { Component } from 'react';
import UdaruLogo from './udaru.png'
import { Actions, Resources } from './permissions'

const defaultUserId = 'Sam'

const fetchJSON = async (...parameters) => {
  const response = await fetch(...parameters)
  const { status } = response

  if (status === 200) return await response.json()

  const { error, message, statusCode } = await response.json()
  throw new Error(`${error} (${statusCode}) ${message}`)
}

class App extends Component {
  constructor (props) {
    super(props)
    this.appendMessage = this.appendMessage.bind(this)
    this.changeUser = this.changeUser.bind(this)
    this.create = this.create.bind(this)
    this.deleteAll = this.deleteAll.bind(this)
    this.list = this.list.bind(this)
    this.reverse = this.reverse.bind(this)
    this.state = { allowedActions: [], products: [], userId: defaultUserId }

    this.changeUser({ target: { value: defaultUserId } })
  }

  async appendMessage () {
    try {
      const products = await fetchJSON('/products', {
        body: prompt('Append a string to each product name:'),
        headers: { Authorization: this.state.userId },
        method: 'PUT'
      })

      this.setState({ error: null, products })
    }
    catch (error) {
      this.setState({ error, products: [] })
    }
  }

  async changeUser (event) {
    const userId = event.target.value

    try {
      const resources = await fetchJSON(`/authorization/access/${userId}`, {
        body: JSON.stringify({
          resourceBatch: [
            { action: Actions.Create, resource: Resources.Products },
            { action: Actions.List, resource: Resources.Products },
            { action: Actions.Delete, resource: Resources.Products },
            { action: Actions.Append, resource: Resources.Products },
            { action: Actions.Reverse, resource: Resources.Products }
          ]
        }),
        headers: { Authorization: userId },
        method: 'POST'
      })

      const allowedActions = resources.filter(({ access }) => access)
        .map(({ action }) => action)

      this.setState({ allowedActions, error: null, products: [], userId })
    }
    catch (error) {
      this.setState({ error })
    }
  }

  async create () {
    const input = prompt('Please enter product names:',
      'productA, productB, productC')
    if (!input) return

    const names = input.split(',').map((s) => s.trim())

    try {
      const products = await fetchJSON('/products', {
        body: JSON.stringify(names),
        headers: { Authorization: this.state.userId },
        method: 'POST'
      })
      this.setState({ error: null, products })
    }
    catch (error) {
      this.setState({ error, products: [] })
    }
  }

  async deleteAll () {
    try {
      const products = await fetchJSON('/products', {
        headers: { Authorization: this.state.userId },
        method: 'DELETE'
      })

      this.setState({ error: null, products })
    }
    catch (error) {
      this.setState({ error, products: [] })
    }
  }

  async list () {
    try {
      const products = await fetchJSON('/products', {
        headers: { Authorization: this.state.userId }
      })

      this.setState({ error: null, products })
    }
    catch (error) {
      this.setState({ error })
    }
  }

  async reverse () {
    try {
      const products = await fetchJSON('/products/reverse', {
        body: '{}',
        headers: { Authorization: this.state.userId },
        method: 'POST'
      })

      this.setState({ error: null, products })
    }
    catch (error) {
      this.setState({ error, products: [] })
    }
  }

  render () {
    const { allowedActions, error, products } = this.state
    const errorMessage = error ? `Error: ${error.message}` : ''
    const sortedProductDivs = products.sort()
      .map((name) => <div key={name}>{name}</div>)

    const classNameFor = allowedActions.reduce(
      (output, action) => ({ ...output, [action]: 'allowed' }), {})

    return (
      <div className="App">
        <header className="App-header">
          <img src={UdaruLogo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Org1</h1>
        </header>
        <div className="App-intro">
          Who are you?
          <select defaultValue={defaultUserId} onChange={this.changeUser}>
            <option value="Sam">Sam Staffman</option>
            <option value="Margaret">Margaret Managerson</option>
            <option value="Rachel">Rachel Owner</option>
            <option value="ROOTid">ROOTid</option>
          </select>
        </div>
        <hr />
        <div>
          <button className={classNameFor[Actions.List]}
            onClick={this.list}>List</button>
          <button className={classNameFor[Actions.Create]}
            onClick={this.create}>Create</button>
          <button className={classNameFor[Actions.Delete]}
            onClick={this.deleteAll}>Delete All</button>
          <button className={classNameFor[Actions.Append]}
            onClick={this.appendMessage}>Append Message</button>
          <button className={classNameFor[Actions.Reverse]}
            onClick={this.reverse}>Reverse</button>
        </div>
        <div className="error">{errorMessage}</div>
        <div>{sortedProductDivs}</div>
      </div>
    )
  }
}

export default App
