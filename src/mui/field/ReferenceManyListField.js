import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import { crudGetManyReference as crudGetManyReferenceAction } from '../../actions/dataActions';
import { getReferences, nameRelatedTo } from '../../reducer/references/oneToMany';
import Datagrid from '../list/Datagrid';

/**
 * Render related records to the current one in a datagrid.
 *
 * You must define the fields to be passed to the datagrid as children.
 *
 * @example
 * <ReferenceManyListField reference="comments" target="post_id">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="body" />
 *         <DateField source="created_at" />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceManyListField>
 */
export class ReferenceManyListField extends Component {
    componentDidMount() {
        const relatedTo = nameRelatedTo(this.props.reference, this.props.record.id, this.props.resource, this.props.target);
        this.props.crudGetManyReference(this.props.reference, this.props.target, this.props.record.id, relatedTo);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.record.id !== nextProps.record.id) {
            const relatedTo = nameRelatedTo(nextProps.reference, nextProps.record.id, nextProps.resource, nextProps.target);
            this.props.crudGetManyReference(nextProps.reference, nextProps.target, nextProps.record.id, relatedTo);
        }
    }

    render() {
        const { resource, reference, referenceRecords, children, basePath } = this.props;
        if (React.Children.count(children) !== 1) {
            throw new Error('<ReferenceManyListField> only accepts a single child (like <Datagrid>)');
        }
        if (typeof referenceRecords === 'undefined') {
            return <LinearProgress style={{ marginTop: '1em' }} />;
        }
        const referenceBasePath = basePath.replace(resource, reference); // FIXME obviously very weak
        return React.cloneElement(children, {
            resource: reference,
            ids: Object.keys(referenceRecords).map(id => parseInt(id, 10)),
            data: referenceRecords,
            basePath: referenceBasePath,
            currentSort: {},
        });
    }
}

ReferenceManyListField.propTypes = {
    resource: PropTypes.string.isRequired,
    label: PropTypes.string,
    record: PropTypes.object,
    reference: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    referenceRecords: PropTypes.object,
    basePath: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    crudGetManyReference: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
    const relatedTo = nameRelatedTo(props.reference, props.record.id, props.resource, props.target);
    return {
        referenceRecords: getReferences(state, props.reference, relatedTo),
    };
}

export default connect(mapStateToProps, {
    crudGetManyReference: crudGetManyReferenceAction,
})(ReferenceManyListField);