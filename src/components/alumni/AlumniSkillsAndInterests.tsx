'use client';

import { useState } from 'react';
import {
  Group,
  Stack,
  Text,
  Badge,
  Card,
  Title,
  Button,
  Collapse,
  Input,
  ActionIcon,
  Tooltip,
  Modal,
  Divider,
  Paper,
  Center
} from '@mantine/core';
import {
  IconStar,
  IconPlus,
  IconX,
  IconEdit,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconFilter,
  IconTags
} from '@tabler/icons-react';
import { AlumniProfile } from '@/types';

interface AlumniSkillsAndInterestsProps {
  alumni: AlumniProfile;
  variant?: 'full' | 'compact' | 'minimal';
  editable?: boolean;
  onUpdate?: (skills: string[], interests: string[]) => void;
  showSearch?: boolean;
  maxDisplay?: number;
}

export function AlumniSkillsAndInterests({
  alumni,
  variant = 'full',
  editable = false,
  onUpdate,
  showSearch = false,
  maxDisplay
}: AlumniSkillsAndInterestsProps) {
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  // Filter skills and interests based on search
  const filteredSkills = alumni.skills.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInterests = alumni.interests.filter(interest =>
    interest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine how many items to show
  const getDisplayItems = (items: string[], showAll: boolean) => {
    if (showAll || !maxDisplay) return items;
    return items.slice(0, maxDisplay);
  };

  const displayedSkills = getDisplayItems(filteredSkills, showAllSkills);
  const displayedInterests = getDisplayItems(filteredInterests, showAllInterests);

  if (variant === 'minimal') {
    return (
      <Group gap="xs">
        {alumni.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="light" size="sm">
            {skill}
          </Badge>
        ))}
        {alumni.skills.length > 3 && (
          <Badge variant="outline" size="sm">
            +{alumni.skills.length - 3} more
          </Badge>
        )}
      </Group>
    );
  }

  if (variant === 'compact') {
    return (
      <Stack gap="sm">
        {alumni.skills.length > 0 && (
          <div>
            <Text size="sm" fw={500} mb="xs">Skills</Text>
            <Group gap="xs">
              {displayedSkills.map((skill) => (
                <Badge key={skill} variant="light" size="sm">
                  {skill}
                </Badge>
              ))}
              {!showAllSkills && alumni.skills.length > (maxDisplay || 5) && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowAllSkills(true)}
                >
                  +{alumni.skills.length - (maxDisplay || 5)} more
                </Button>
              )}
            </Group>
          </div>
        )}

        {alumni.interests.length > 0 && (
          <div>
            <Text size="sm" fw={500} mb="xs">Interests</Text>
            <Group gap="xs">
              {displayedInterests.map((interest) => (
                <Badge key={interest} variant="outline" size="sm">
                  {interest}
                </Badge>
              ))}
              {!showAllInterests && alumni.interests.length > (maxDisplay || 5) && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowAllInterests(true)}
                >
                  +{alumni.interests.length - (maxDisplay || 5)} more
                </Button>
              )}
            </Group>
          </div>
        )}
      </Stack>
    );
  }

  // Full variant
  return (
    <Stack gap="md">
      {/* Search */}
      {showSearch && (alumni.skills.length > 5 || alumni.interests.length > 5) && (
        <Input
          placeholder="Search skills and interests..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightSection={
            searchQuery && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />
      )}

      {/* Skills */}
      {alumni.skills.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconStar size={16} color="gray" />
                <Title order={4}>Skills</Title>
                <Badge variant="light" size="sm">
                  {alumni.skills.length}
                </Badge>
              </Group>
              {editable && (
                <Tooltip label="Edit Skills">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setEditMode(true)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>

            {displayedSkills.length > 0 ? (
              <Group gap="xs">
                {displayedSkills.map((skill) => (
                  <SkillBadge
                    key={skill}
                    skill={skill}
                    variant="skill"
                    editable={editMode}
                    onRemove={() => {
                      // Handle skill removal
                      const updatedSkills = alumni.skills.filter(s => s !== skill);
                      onUpdate?.(updatedSkills, alumni.interests);
                    }}
                  />
                ))}
                {!showAllSkills && alumni.skills.length > displayedSkills.length && (
                  <Button
                    variant="subtle"
                    size="xs"
                    rightSection={<IconChevronDown size={14} />}
                    onClick={() => setShowAllSkills(true)}
                  >
                    Show {alumni.skills.length - displayedSkills.length} more
                  </Button>
                )}
                {showAllSkills && alumni.skills.length > (maxDisplay || 10) && (
                  <Button
                    variant="subtle"
                    size="xs"
                    rightSection={<IconChevronUp size={14} />}
                    onClick={() => setShowAllSkills(false)}
                  >
                    Show less
                  </Button>
                )}
              </Group>
            ) : (
              <Text c="dimmed" size="sm">
                {searchQuery ? 'No skills match your search' : 'No skills listed'}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Interests */}
      {alumni.interests.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconTags size={16} color="gray" />
                <Title order={4}>Interests</Title>
                <Badge variant="light" size="sm">
                  {alumni.interests.length}
                </Badge>
              </Group>
              {editable && (
                <Tooltip label="Edit Interests">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setEditMode(true)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>

            {displayedInterests.length > 0 ? (
              <Group gap="xs">
                {displayedInterests.map((interest) => (
                  <SkillBadge
                    key={interest}
                    skill={interest}
                    variant="interest"
                    editable={editMode}
                    onRemove={() => {
                      // Handle interest removal
                      const updatedInterests = alumni.interests.filter(i => i !== interest);
                      onUpdate?.(alumni.skills, updatedInterests);
                    }}
                  />
                ))}
                {!showAllInterests && alumni.interests.length > displayedInterests.length && (
                  <Button
                    variant="subtle"
                    size="xs"
                    rightSection={<IconChevronDown size={14} />}
                    onClick={() => setShowAllInterests(true)}
                  >
                    Show {alumni.interests.length - displayedInterests.length} more
                  </Button>
                )}
                {showAllInterests && alumni.interests.length > (maxDisplay || 10) && (
                  <Button
                    variant="subtle"
                    size="xs"
                    rightSection={<IconChevronUp size={14} />}
                    onClick={() => setShowAllInterests(false)}
                  >
                    Show less
                  </Button>
                )}
              </Group>
            ) : (
              <Text c="dimmed" size="sm">
                {searchQuery ? 'No interests match your search' : 'No interests listed'}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Empty State */}
      {alumni.skills.length === 0 && alumni.interests.length === 0 && (
        <Paper p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <IconTags size={48} color="gray" />
              <Text size="lg" c="dimmed">No Skills or Interests</Text>
              <Text size="sm" c="dimmed" ta="center">
                Skills and interests help others understand your expertise and passions
              </Text>
              {editable && (
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setEditMode(true)}
                >
                  Add Skills & Interests
                </Button>
              )}
            </Stack>
          </Center>
        </Paper>
      )}

      {/* Edit Modal */}
      <Modal
        opened={editMode}
        onClose={() => setEditMode(false)}
        title="Edit Skills & Interests"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Add or remove skills and interests to help others understand your expertise and passions.
          </Text>
          
          {/* Skills Editor */}
          <div>
            <Text fw={500} mb="sm">Skills</Text>
            <Group gap="xs" mb="sm">
              {alumni.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="light"
                  rightSection={
                    <ActionIcon size="xs" variant="transparent">
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  {skill}
                </Badge>
              ))}
            </Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={14} />}
            >
              Add Skill
            </Button>
          </div>

          <Divider />

          {/* Interests Editor */}
          <div>
            <Text fw={500} mb="sm">Interests</Text>
            <Group gap="xs" mb="sm">
              {alumni.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  rightSection={
                    <ActionIcon size="xs" variant="transparent">
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  {interest}
                </Badge>
              ))}
            </Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={14} />}
            >
              Add Interest
            </Button>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditMode(false)}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// Individual skill/interest badge component
interface SkillBadgeProps {
  skill: string;
  variant: 'skill' | 'interest';
  editable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

function SkillBadge({ skill, variant, editable, onRemove, onClick }: SkillBadgeProps) {
  const badgeProps = {
    variant: variant === 'skill' ? 'light' as const : 'outline' as const,
    style: { cursor: onClick ? 'pointer' : 'default' },
    onClick
  };

  if (editable && onRemove) {
    return (
      <Badge
        {...badgeProps}
        rightSection={
          <ActionIcon
            size="xs"
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <IconX size={10} />
          </ActionIcon>
        }
      >
        {skill}
      </Badge>
    );
  }

  return <Badge {...badgeProps}>{skill}</Badge>;
}

// Skills filter component for search/filter functionality
interface SkillsFilterProps {
  allSkills: string[];
  selectedSkills: string[];
  onSelectionChange: (skills: string[]) => void;
}

export function SkillsFilter({ allSkills, selectedSkills, onSelectionChange }: SkillsFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSelectionChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSelectionChange([...selectedSkills, skill]);
    }
  };

  return (
    <Stack gap="sm">
      <Input
        placeholder="Search skills..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <Group gap="xs">
        {filteredSkills.map((skill) => (
          <Badge
            key={skill}
            variant={selectedSkills.includes(skill) ? 'filled' : 'light'}
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </Badge>
        ))}
      </Group>
      
      {selectedSkills.length > 0 && (
        <Button
          variant="subtle"
          size="xs"
          onClick={() => onSelectionChange([])}
        >
          Clear all ({selectedSkills.length})
        </Button>
      )}
    </Stack>
  );
}