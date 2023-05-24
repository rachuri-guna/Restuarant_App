//search functionality
// Filter menu items by food name and food type
function filterMenuItems() {
  let input = document.getElementById("menuFilter").value.toLowerCase();
  let menuItems = document.getElementById("menu-items").children;
  for (let i = 0; i < menuItems.length; i++) {
    let course = menuItems[i];
    let foods = course.getElementsByClassName("food");
    for (let j = 0; j < foods.length; j++) {
      let food = foods[j];
      let name = food.getElementsByTagName("h5")[0].innerText.toLowerCase();
      let type = food.getAttribute("type").toLowerCase();
      if (name.includes(input) || type.includes(input)) {
        food.style.display = "";
      } else {
        food.style.display = "none";
      }
    }
  }
}

// Add event listener to the search input
let menuFilter = document.getElementById("menuFilter");
menuFilter.addEventListener("keyup", filterMenuItems);


const tableFilter = document.getElementById("tableFilter");
const tableContainer = document.getElementById("table-container");

tableFilter.addEventListener("keyup", ()=>{

  const filterValue = tableFilter.value.toLowerCase();
  
  const tables = tableContainer.getElementsByClassName("table");
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const tableTitle = table.querySelector("h5");
    const tableTitleText = tableTitle.textContent || tableTitle.innerText;
    if (tableTitleText.toLowerCase().indexOf(filterValue) > -1) {
      table.style.display = "";
    } else {
      table.style.display = "none";
    }
  }
});


// Function to drag and drop menu items onto tables
function dragAndDrop() {
  const tables = document.querySelectorAll('.table');
  const foods = document.querySelectorAll('.food');

  // Set up event listeners for drag events
  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    food.addEventListener('dragstart', dragStart);
    food.addEventListener('dragend', dragEnd);
  }

  // Set up event listeners for drop events
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    table.addEventListener('dragover', dragOver);
    table.addEventListener('dragenter', dragEnter);
    table.addEventListener('dragleave', dragLeave);
    table.addEventListener('drop', dragDrop);
  }

  // Drag functions
  function dragStart() {
    this.classList.add('dragging');
  }

  function dragEnd() {
    this.classList.remove('dragging');
  }


  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.preventDefault();
    this.classList.add('hovered');
  }

  function dragLeave() {
    this.classList.remove('hovered');
  }

  function dragDrop() {
    var count=0;
    const tableId = this.id;
    const foodId = document.querySelector('.dragging').id;
    const food = document.getElementById(foodId);
    const foodName = food.querySelector('h5').innerText;
    const foodPrice = Number(food.querySelector('p').innerText.slice(3));
    const table = document.getElementById(tableId);
    const tableTitle = table.querySelector('h5').innerText;
    const tableTotal = table.querySelector('p');
    const tableTotalPrice = Number(tableTotal.innerText.split('|')[0].slice(3));
    const tableTotalItems = Number(tableTotal.innerText.split(':')[1]);
  
    // Add item to table order and update total
    tableTotal.innerText = `Rs.${tableTotalPrice + foodPrice} | Total items:${tableTotalItems + 1}`;
    count=tableTotalItems + 1;
    // Store details in session storage
    const orderDetails = JSON.parse(sessionStorage.getItem(tableTitle)) || {};
    if (orderDetails[foodName]) {
      orderDetails[foodName].quantity += 1;
    } else {
      orderDetails[foodName] = {
        quantity: 1,
        price: foodPrice,
      };
    }
    orderDetails.totalPrice = tableTotalPrice + foodPrice;
    orderDetails.tableTotalItems=count;
    sessionStorage.setItem(tableTitle, JSON.stringify(orderDetails));
  }
  
}
dragAndDrop();

function showModal(tableId) {
  document.getElementById(`${tableId}`).style.backgroundColor = 'gray';

  const orderDetails = JSON.parse(sessionStorage.getItem(tableId)) || {};

  // Get the modal element and its content element
  const modal = document.getElementById('myModal');
  modal.setAttribute("tableId",tableId);
  const modalContent = modal.querySelector('.modal-content');

  // Clear the modal content before adding the table orders
  modalContent.innerHTML = '';

  // Add the table orders to the modal content
  const headingdiv=document.createElement('div');
  headingdiv.id='headingdiv';
  const heading = document.createElement('h3');
  heading.style.textAlign= 'center';
  heading.style.width= '100%';
  heading.innerText = `${tableId} Orders`;

  headingdiv.style.display='flex';
  headingdiv.style.flexDirection='row';
  headingdiv.style.justifyContent= 'space-between';
  headingdiv.appendChild(heading);
  modalContent.appendChild(headingdiv);

  const table = document.createElement('table');
  const tableHeader = document.createElement('tr');
  const itemNameHeader = document.createElement('th');
  itemNameHeader.innerText = 'Item Name';
  tableHeader.appendChild(itemNameHeader);
  const quantityHeader = document.createElement('th');
  quantityHeader.innerText = 'Quantity';
  tableHeader.appendChild(quantityHeader);
  const priceHeader = document.createElement('th');
  priceHeader.innerText = 'Price';
  tableHeader.appendChild(priceHeader);
  table.appendChild(tableHeader);
  const actionHeader = document.createElement('th');
  actionHeader.innerText = 'Action';
  tableHeader.appendChild(actionHeader);
  table.appendChild(tableHeader);

  var totalAmount = orderDetails.totalPrice || 0;
  for (const itemName in orderDetails) {
    if (itemName !== 'totalPrice' && itemName !== 'tableTotalItems') {
      const order = orderDetails[itemName];
      const row = document.createElement('tr');
      const itemNameCell = document.createElement('td');
      itemNameCell.innerText = itemName;
      row.appendChild(itemNameCell);

      const quantityCell = document.createElement('td');
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.value = order.quantity;
      quantityInput.min = 0;
      quantityInput.addEventListener('input', (event) => {
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 0) {
          order.quantity = newQuantity;
          orderDetails[itemName] = order;
          quantityCell.value = order.quantity;
          priceCell.innerText = `Rs. ${order.price * order.quantity}`;
          updateTotal();
          sessionStorage.setItem(tableId, JSON.stringify(orderDetails));
        }
        else {
          totalAmount = orderDetails[itemName];
        }

      });
      quantityCell.appendChild(quantityInput);
      row.appendChild(quantityCell);
      const priceCell = document.createElement('td');
      priceCell.innerText = `Rs. ${order.price * order.quantity}`;
      row.appendChild(priceCell);
      table.appendChild(row);
      const deleteCell=document.createElement('td');
      deleteCell.innerHTML='<i class="fa fa-trash" aria-hidden="true"></i>';
      row.appendChild(deleteCell);
      table.appendChild(row);
      // totalAmount += order.price * order.quantity;
      deleteCell.addEventListener('click',()=>{
        //alert("deleting row");
        table.removeChild(row);
        order.quantity=0;
        //order.removeItem(itemName);
        updateTotal();
        sessionStorage.setItem(tableId, JSON.stringify(orderDetails));
      })
    } 
  }
  const tableFooter = document.createElement('tr');
  const priceFooter = document.createElement('th');
  priceFooter.colSpan = 3;
  priceFooter.innerText = `Total Amount : Rs. ${totalAmount}`;
  tableFooter.appendChild(priceFooter);
  table.appendChild(tableFooter);
  modalContent.appendChild(table);

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', closeModal);
  closeButton.style.fontWeight='900';
  closeButton.style.borderRadius='30%';
  headingdiv.appendChild(closeButton);



  const billButton = document.createElement('button');
  billButton.style.width='15%';
  billButton.style.alignSelf='center';
  billButton.style.borderRadius='10%';
  billButton.innerText = 'Bill';
  billButton.addEventListener('click', () => {
    // Generate the bill here
    closeModal();
    alert(`Total amount: Rs. ${totalAmount}`);
    sessionStorage.removeItem(tableId);

    const table = document.getElementById(tableId);
    const tableTotal = table.querySelector('p');
    tableTotal.innerText = `Rs.0 | Total items:0`;
  });
  modalContent.appendChild(billButton);

  function updateTotal() {
    totalAmount = 0;
    var count_items=0;
    for (const itemName in orderDetails) {
      if (itemName !== 'totalPrice' && itemName!=='tableTotalItems') {
        const order = orderDetails[itemName];
        totalAmount += order.price * order.quantity;
        count_items+=order.quantity;
      } 
    }
    priceFooter.innerText = `Total Amount : Rs. ${totalAmount}`;
    orderDetails.tableTotalItems=count_items;
    orderDetails.totalPrice=totalAmount;
  }
  
  // Show the modal
  modal.style.display = 'block';
}

function closeModal() {

  var current= document.getElementById("myModal");
  current.style.display = "none";
  var value=current.getAttribute("tableId");
  
  document.getElementById(`${value}`).style.backgroundColor = 'white';
  
  const orderDetails = JSON.parse(sessionStorage.getItem(value));
  // console.log(orderDetails);
  // console.log(orderDetails.totalPrice,orderDetails.tableTotalItems);

  const table = document.getElementById(value);
  const tableTotal = table.querySelector('p');
  tableTotal.innerText = `Rs.${orderDetails.totalPrice} | Total items:${orderDetails.tableTotalItems}`;

}









