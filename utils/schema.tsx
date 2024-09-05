import { integer, numeric, pgTable, timestamp, serial, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const Budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: varchar('amount').notNull(),
    icon: varchar('icon'),
    createdBy: varchar('createdBy').notNull()
});

export const Expenses = pgTable('expenses', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: numeric('amount').notNull().default('0'),
    budgetId: integer('budgetId').references(() => Budgets.id),
    createdAt: varchar('createdAt').notNull()
});


export const Category = pgTable('category', {
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),  // DateTime with default `now()`
    name: varchar('name').notNull(),  // String type
    userId: varchar('userId').notNull(),  // String type
    icon: varchar('icon').notNull(),  // String type
    type: varchar('type').notNull().default('income'),  // String type with default value 'income'
  },
  // Composite unique key constraint for (name, userId, type)
  (category) => ({
    uniqueCategory: uniqueIndex('unique_category').on(category.name, category.userId, category.type),
  }));