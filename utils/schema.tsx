import { integer, numeric, pgTable, serial, varchar } from "drizzle-orm/pg-core";

// Categories Table with Budget Amount
export const Categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    icon: varchar('icon').notNull(),
    budgetAmount: numeric('budgetAmount'),
    createdBy: varchar('createdBy').notNull()
});

// Income Table
export const Income = pgTable('income', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: numeric('amount').notNull().default('0'),
    transactionDate: varchar('transactionDate').notNull(),
    createdBy: varchar('createdBy').notNull() 
});

// Expenses Table
export const Expenses = pgTable('expenses', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: numeric('amount').notNull().default('0'),
    categoryId: integer('categoryId')
        .references(() => Categories.id)
        .notNull(),  // Reference to the category
    createdAt: varchar('createdAt').notNull(),
    createdBy: varchar('createdBy').notNull() 
});