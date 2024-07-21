import React, { useEffect, useState } from 'react';
import CartItems from '../Components/CartItems/CartItems';
import './CSS/Cart.css'
const Cart = () => {
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getTotalCartItems();
  }, []);

  useEffect(() => {
    const getTotalCartAmount = () => {
      console.log(products);
      let sum = 0;
      if (Array.isArray(products)) {
        products.forEach((e) => {
          sum += e.price * e.quantity;
        });
      }
      setTotal(sum);
    };

    getTotalCartAmount();  // Call the function immediately when products change
  }, [products]);

  const getTotalCartItems = () => {
    try {
      if (localStorage.getItem('auth-token')) {
        fetch('http://localhost:4002/getcart', {
          method: 'GET',
          headers: {
            Accept: 'application/form-data',
            'auth-token': `${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => response.json())
        .then((data) => {
          setProducts(data.cart.products);
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const removeProduct = (productId) => {
    setProducts(prevProducts =>
      prevProducts.filter(product => product.productId._id !== productId)
    );
  };

  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {products.map((e) => (
        <CartItems key={e.productId._id} props={e} removeProduct={removeProduct} />
      ))}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Total</p>
              <p>$ {total}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder='promo code' />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
