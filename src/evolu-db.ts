import * as S from "@effect/schema/Schema";
import {
	SqliteBoolean,
	SqliteDate,
	String as SqliteString,
	createEvolu,
	createIndexes,
	database,
	id,
	table,
} from "@evolu/react";

export const NonEmptyString100 = SqliteString.pipe(
	S.minLength(1),
	S.maxLength(100),
	S.brand("NonEmptyString100"),
);
export type TNonEmptyString100 = typeof NonEmptyString100.Type;

export const CurrencyIsoString = SqliteString.pipe(
	S.minLength(3),
	S.maxLength(3),
	S.brand("CurrencyIsoString"),
);
export type TCurrencyIsoString = typeof CurrencyIsoString.Type;

export const AmountString = SqliteString.pipe(
	S.pattern(/^\d+\.\d{8}$/),
	S.brand("AmountString"),
);
export type TAmountString = typeof AmountString.Type;

// Branded Ids
const EntryId = id("Entry");
export type TEntryId = typeof EntryId.Type;

const RecurringConfigId = id("RecurringConfig");
export type TRecurringConfigId = typeof RecurringConfigId.Type;

const ExclusionId = id("Exclusion");
export type TExclusionId = typeof ExclusionId.Type;

const GroupId = id("Group");
export type TGroupId = typeof GroupId.Type;

const TagId = id("Tag");
export type TTagId = typeof TagId.Type;

const EntryTable = table({
	id: EntryId,
	date: SqliteDate,
	type: S.Union(S.Literal("income"), S.Literal("expense")),
	name: NonEmptyString100,
	amount: AmountString,
	fullfilled: SqliteBoolean,
	currencyCode: CurrencyIsoString,
	recurringId: S.NullOr(RecurringConfigId),
	groupId: S.NullOr(GroupId),
	tagId: S.NullOr(TagId),
});

const GroupTable = table({
	id: GroupId,
	name: NonEmptyString100,
	icon: S.NullOr(S.String),
});

const TagTable = table({
	id: TagId,
	name: NonEmptyString100,
	suggestId: S.NullOr(S.String),
	color: S.NullOr(S.String),
	icon: S.NullOr(S.String),
});

const RecurringConfigTable = table({
	id: RecurringConfigId,
	frequency: S.Union(S.Literal("week"), S.Literal("month"), S.Literal("year")),
	interval: S.Number,
	every: S.Number,
	startDate: SqliteDate,
	endDate: S.NullOr(SqliteDate),
});

const ExclusionTable = table({
	id: ExclusionId,
	recurringId: RecurringConfigId,
	date: SqliteDate,
	reason: S.Union(S.Literal("deletion"), S.Literal("modification")),
	modifiedEntryId: S.NullOr(EntryId),
});

// Now, we can define the database schema.
export const EvoluDB = database({
	entry: EntryTable,
	entryGroup: GroupTable,
	entryTag: TagTable,
	recurringConfig: RecurringConfigTable,
	exclusion: ExclusionTable,
});

// TODO: Add indexes
const indexes = createIndexes((create) => [
	create("indexEntryByDate").on("entry").column("date"),
]);

const decode = S.decodeSync;
const decodeName = S.decodeSync(NonEmptyString100);
const decodeCurrency = S.decodeSync(CurrencyIsoString);
const decodeAmount = S.decodeSync(AmountString);
const decodeDate = S.decodeSync(SqliteDate);
const decodeGroupId = S.decodeSync(GroupId);
const decodeTagId = S.decodeSync(TagId);

export const evolu = createEvolu(EvoluDB, {
	// minimumLogLevel: "trace",
	indexes,
	...(process.env.NODE_ENV === "development" && {
		syncUrl: "http://localhost:4000",
	}),
	initialData: (_db) => {
		// const recurring = _db.create("recurringConfig", {
		// 	frequency: "month",
		// 	interval: 12,
		// 	every: 2,
		// 	startDate: new Date("2024-09-01"),
		// 	endDate: new Date("2025-09-01"),
		// });
		// _db.create("entry", {
		// 	name: decodeName("2 month for 1 year"),
		// 	type: "income",
		// 	amount: decodeAmount("1000.00000000"),
		// 	fullfilled: false,
		// 	date: new Date("2024-09-01"),
		// 	currencyCode: decodeCurrency("USD"),
		// 	recurringId: recurring.id,
		// });
		// const recurring2 = db.create("recurringConfig", {
		// 	frequency: "month",
		// 	interval: 0,
		// 	startDate: new Date("2024-01-01"),
		// });
		// db.create("entry", {
		// 	name: decodeName("Rent"),
		// 	type: "expense",
		// 	amount: decodeAmount("500.00000000"),
		// 	fullfilled: false,
		// 	date: new Date("2024-01-01"),
		// 	currencyCode: decodeCurrency("USD"),
		// 	recurringId: recurring2.id,
		// });
	},
});

export type TEvoluDB = typeof EvoluDB.Type;
export type TEntryTable = typeof EntryTable.Type;

export {
	S,
	decode,
	decodeAmount,
	decodeCurrency,
	decodeDate,
	decodeGroupId,
	decodeName,
	decodeTagId,
};
