/**
 * From the Nextra docs:
 * https://nextra.site/docs/file-conventions/meta-file
 */

import type { MetaRecord } from 'nextra';

/**
 * type MetaRecordValue =
 *  | TitleSchema
 *  | PageItemSchema
 *  | SeparatorSchema
 *  | MenuSchema
 *
 * type MetaRecord = Record<string, MetaRecordValue>
 **/
const meta: MetaRecord = {
  index: 'Introduction',
};

export default meta;
