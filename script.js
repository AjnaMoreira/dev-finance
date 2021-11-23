const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    },

    close() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get() {
        return (
            JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
        )
    },

    set(transactions) {
        localStorage.setItem(
            'dev.finances:transactions',
            JSON.stringify(transactions)
        )
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formartCurrency(transaction.amount)

        const html = `

    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td class="remove">
        <img onclick="Transaction.remove(${index})"
            src="./assets/minus.svg"
            alt="Remover transação"
        />
        
    </td>

`

        return html
    },

    updateBalance() {
        document.querySelector('#incomeDisplay').innerHTML =
            Utils.formartCurrency(Transaction.incomes())

        document.querySelector('#expenseDisplay').innerHTML =
            Utils.formartCurrency(Transaction.expenses())

        document.querySelector('#totalDisplay').innerHTML =
            Utils.formartCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formartCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField() {
        const { description, amount, date } = Form.getValues()

        if (
            description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === ''
        ) {
            throw new Error('Por favor, preencha todos os campos!')
        }
    },

    formateValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    errorMessage() {
        const msg = document.querySelector('.error-message')

        document.querySelector('.button.save').addEventListener('click', () => {
            msg.classList.add('active')
        })

        document.querySelector('.button.ok').addEventListener('click', () => {
            msg.classList.remove('active')
        })
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()

            const transaction = Form.formateValues()

            Transaction.add(transaction)

            Form.clearFields()

            Modal.close()
        } catch (error) {
            Form.errorMessage()
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
