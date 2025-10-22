// Privata Query Builder - Fluent query interface with GDPR/HIPAA compliance
// Complete query builder for healthcare data compliance

export { QueryBuilder, createQueryBuilder } from './QueryBuilder';
export type { 
  QueryOptions, 
  FilterCondition, 
  SortOption, 
  PaginationOptions, 
  QueryResult 
} from './QueryBuilder';

// Default export
export default {
  QueryBuilder,
  createQueryBuilder,
};

