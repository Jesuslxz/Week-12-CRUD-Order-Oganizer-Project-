class Customer {
    constructor(name){
        this.name = name;
        this.order = [];
    }

    addOrder(flower, quantity){
        this.orders.push(new Order(flower, quantity));
    }
}

class Order{
    // static numberOfOrders = 0;


    constructor(flower, quantity){
        this.flower = flower;
        this.quantity = quantity;
        // Order.numberOfOrders += 1;
    }
}

class FlowerService{
    static url = 'https://64f2b594edfa0459f6c5f7c7.mockapi.io/Customers'
    
    static getAllCustomers(){
        //returns a promise for use use .then method
        //promise will ideal return an array of all customers
        return $.get(this.url);
    }

    static getCustomer(id){
        //will return a customer object
        return $.get(this.url + `/id/${id}`, (data) => console.log(data));
    }

    static createCustomer(customer){
        //sends a customer object
        return $.post(this.url, customer);
    }

    static updateCustomer(customer){
        return $.ajax({
            url: this.url + `/${customer.id}`,
            dataType: 'json',
            data: JSON.stringify(customer),
            contentType: 'application/json',
            type: 'PUT',
        });
    }

    static deleteCustomer(id){
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE',
        });
    }
}




class DOMManager {
    static customers;

    static listAllCustomers(){
        //receives an array of customers held in the api
        FlowerService.getAllCustomers().then(customer => this.render(customer));
    }
    static deleteCustomer(id){
        FlowerService.deleteCustomer(id)
        .then(() => {
            return FlowerService.getAllCustomers();
        }).then( (allCustomers) => this.render(allCustomers));
    }

    static createCustomer(name){
        FlowerService.createCustomer(new Customer(name))
        .then(() => {
            return FlowerService.getAllCustomers();
        })
        .then((allCustomers)=> this.render(allCustomers))
    }
    static addOrder(id){
        //loops through all customers and when the Id's match an order is instantiated 
        for(let customer of this.customers){
            if (customer.id == id){
                customer.orders.push(new Order($(`#${customer.id}-flower-order`).val(), $(`#${customer.id}-flower-quantity`).val()));
                FlowerService.updateCustomer(customer)
                .then(()=> {
                    return FlowerService.getAllCustomers();
                })
                .then((allCustomers => this.render(allCustomers)));
            }
        }
    }

    static deleteOrder(customerId, orderId){
        for(let customer of this.customers){
            if( customer.id == customerId){
                for(let order of customer.orders){
                    if(order.id == orderId){
                        customer.rooms.splice(customer.orders.indexOf(order),1);
                        FlowerService.updateCustomer(customer)
                        .then(()=> {
                            return FlowerService.getAllCustomers();
                        })
                        .then((allCustomers => this.render(allCustomers)));
                         }
                }
            }
        }
    }

    static render (customers){
        this.customers = customers; // an array
        $('#app-div').empty();
        for (let customer of customers){ // iterated through the array and each customer hold properties of id, name, and orders, 
            $('#app-div').prepend(
                `<div id="${customer.id}" class="card mb-5">
                    <div class="card-header">
                        <h2>${customer.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteCustomer('${customer.id}')"> Delete Customer </button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class = "col-sm"> 
                                    <input type="text" id="${customer.id}-flower-order" class= "form-control" placeholder="FlowerType">
                                </div>
                                <div class = "col-sm"> 
                                    <input type="text" id="${customer.id}-flower-quantity" class= "form-control" placeholder="Quantity">
                                </div>
                            </div>
                            <button id="${customer.id}-new-order" onclick="DOMManager.addOrder('${customer.id}')" class="btn btn-success"> Add Order </button>
                        </div>
                    </div>
                </div><br>`
                );
                for (let order of customer.orders) {
                    console.log(order)
              
                    $(`#${customer.id}`).find('.card-body').append(
                        `<p>
                        <span id="Flower"-${order.id}"><strong>Flower: </strong> ${order.flower} </span>   
                        <span id="quantity-${order.id}"><strong>Quantity: </strong> ${order.quantity} </span>   
                        <button class="btn btn-danger" onclick="DOMManager.deleteOrder('${customer.id}', '${order.id}')"> Delete Order</button>
                        </p>
                        `
                        );
                 }
        }
    }
}
//call the create customer method once the create customer button is clicked
$("#create-new-customer").click(() => {
    DOMManager.createCustomer($('#customer').val());
    $('#customer').val('')
});
DOMManager.listAllCustomers();