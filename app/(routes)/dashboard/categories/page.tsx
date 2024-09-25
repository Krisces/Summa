import React from 'react'
import CategoryList from './_components/CategoryList'

function Catgories() {
  return (
    <div className='p-10'>
      <title>Summa Categories</title>
      <h2 className='font-bold text-3xl'>
        My Categories
      </h2>
      <CategoryList/>
    </div>
  )
}

export default Catgories