/**
 * Query - Database query interface
 *
 * This type defines the structure for database queries,
 * supporting both simple and complex query operations.
 */

export interface Query {
  /** Simple field equality */
  [key: string]: any;

  /** MongoDB-style operators */
  $and?: Query[];
  $or?: Query[];
  $nor?: Query[];
  $not?: Query;

  /** Comparison operators */
  $eq?: any;
  $ne?: any;
  $gt?: any;
  $gte?: any;
  $lt?: any;
  $lte?: any;
  $in?: any[];
  $nin?: any[];

  /** String operators */
  $regex?: string;
  $options?: string;

  /** Array operators */
  $all?: any[];
  $elemMatch?: Query;
  $size?: number;

  /** Existence operators */
  $exists?: boolean;
  $type?: string;

  /** Geospatial operators */
  $geoWithin?: any;
  $geoIntersects?: any;
  $near?: any;
  $nearSphere?: any;

  /** Text search */
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
}
