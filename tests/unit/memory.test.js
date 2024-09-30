const MemoryDB = require('../../src/model/data/memory/memory-db');
const { 
    writeFragment,
    readFragment,
    writeFragmentData,
    readFragmentData,
    listFragments,
    deleteFragment,
  } = require('../../src/model/data/memory/index');

  describe('Fragment Functions', () => {
    const ownerId = 'user1';
    const fragmentId = 'fragment1';
    const fragment = { ownerId, id: fragmentId, content: 'This is a fragment.' };
    const buffer = Buffer.from('This is fragment data.');
  
    test('writeFragment() work correctly', async () => {
      await writeFragment(fragment);
      const result = await readFragment(ownerId, fragmentId);
      expect(result).toEqual(fragment);
    });
  
    test(' readFragmentData() work correctly', async () => {
      await writeFragmentData(ownerId, fragmentId, buffer);
      const result = await readFragmentData(ownerId, fragmentId);
      expect(result).toEqual(buffer);
    });
  
    test('listFragments() returns fragment id for a user', async () => {
      await writeFragment(fragment);
      const result = await listFragments(ownerId);
      expect(result).toEqual([fragmentId]);
    });
  
    test('listFragments() returns expanded fragments when requested', async () => {
      await writeFragment(fragment);
      const result = await listFragments(ownerId, true);
      expect(result).toEqual([fragment]);
    });
  
    test('deleteFragment() removes metadata and data', async () => {
      await writeFragment(fragment);
      await writeFragmentData(ownerId, fragmentId, buffer);
      
      await deleteFragment(ownerId, fragmentId);
  
      const metadataResult = await readFragment(ownerId, fragmentId);
      const dataResult = await readFragmentData(ownerId, fragmentId);
      
      expect(metadataResult).toBeUndefined(); // Assume undefined when not found
      expect(dataResult).toBeUndefined(); // Assume undefined when not found
    });
  
    test('readFragment() returns undefined for non-existent fragment', async () => {
      const result = await readFragment(ownerId, fragmentId);
      expect(result).toBeUndefined();
    });
  
    test('readFragmentData() returns undefined for non-existing fragment data', async () => {
      const result = await readFragmentData(ownerId, fragmentId);
      expect(result).toBeUndefined();
    });
  
    test('deleteFragment() handles non-existing fragment ', async () => {
        await expect(deleteFragment(ownerId, fragmentId)).rejects.toThrow(
          `missing entry for primaryKey=${ownerId} and secondaryKey=${fragmentId}`);
      });
  });