import React, { useContext, useEffect, useState } from 'react';
import './CartItems.css';
import remove_icon from '../Assets/cart_cross_icon.png';

const CartItems = ({ props, removeProduct }) => {
  const [remove, setRemove] = useState(false);

  const removefromcart = (itemId) => {
    try {
      console.log(itemId);
      if (localStorage.getItem('auth-token')) {
        fetch('http://localhost:4002/deletecart', {
          method: 'POST',
          headers: {
            Accept: 'application/form-data',
            'auth-token': `${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "productId": itemId }),
        })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          removeProduct(itemId);  // Call the function to update the parent state
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      {remove === false && 
        <div className='cartitems'>
          <div className="cartitems-format-main">
            <img className='product_image' src={props.productId.image} alt="" />
            <p>{props.productId.name}</p>
            <p>{props.price}</p>
            <p>{props.quantity}</p>
            <p>{props.price * props.quantity}</p>
            <img className=' rem-icon'onClick={() => { setRemove(true); removefromcart(props.productId._id) }} src={remove_icon} alt="" />
          </div>
          <hr />
        </div>
      }
    </>
  );
}

export default CartItems;

